<template>
  <div
    :key="`chart_${nodeElement.id}`"
    :timeSeriesTmpName="nodeElement.inputDataInfo.name"
  ></div>
</template>

<script>
import Highcharts from 'highcharts';
require('highcharts/modules/exporting')(Highcharts);
require('highcharts/modules/drilldown')(Highcharts);

import barChartConfig from '../default-charts/basic-bar.json';
import columnChartConfig from '../default-charts/basic-column.json';
import lineChartConfig from '../default-charts/basic-line.json';

const defaultSettings = {
  chart: {
    spacing: [0, 0, 0, 0],
  },
  credits: {
    enabled: false,
  },
  lang: {
    viewFullscreen: 'Im Vollbildmodus ansehen',
  },
  exporting: {
    buttons: {
      contextButton: {
        menuItems: ['viewFullscreen'],
      },
    },
  },
};

export default {
  name: 'timeSeriesChart',

  props: {
    nodeElement: { type: Object },
    task: {
      type: Object,
      default() {
        return null;
      },
    },
  },

  mounted() {
    Highcharts.setOptions({
      lang: {
        months: [
          'Januar',
          'Februar',
          'März',
          'April',
          'Mai',
          'Juni',
          'Juli',
          'August',
          'September',
          'Oktober',
          'November',
          'Dezember',
        ],
        weekdays: [
          'Sonntag',
          'Montag',
          'Dienstag',
          'Mittwoch',
          'Donnerstag',
          'Freitag',
          'Samstag',
        ],
        shortMonths: [
          'Jan',
          'Feb',
          'Mär',
          'Apr',
          'Mai',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Okt',
          'Nov',
          'Dez',
        ],
      },
      tooltip: {
        outside: true,
      },
    });
    Highcharts.chart(this.$el, this.getChartConfig());
  },

  data() {
    return {
      defaultChartConfig: {
        'basic-bar': barChartConfig,
        'basic-line': lineChartConfig,
        'basic-column': columnChartConfig,
      },
      highchartInstance: null,
      highChartOptions: {
        ...defaultSettings,
      },
      dataframeChartOptions: {
        ...defaultSettings,
      },
      timeSeriesChartOptions: {
        ...defaultSettings,
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
            month: '%b %Y',
            year: '%Y',
          },
          tickInterval: 30 * 24 * 3600 * 1000,
        },
        series: [
          {
            data: null,
          },
        ],
      },
    };
  },

  methods: {
    getChartConfig() {
      try {
        if ('dataframe' in this.nodeElement.value) {
          let tmpObj = JSON.parse(JSON.stringify(this.dataframeChartOptions));

          const dataframeObject = JSON.parse(
            JSON.stringify(this.nodeElement.value.dataframe)
          );

          // to change the structure of data to column => row
          const chartData = dataframeObject.data[0].map((data, index) =>
            dataframeObject.data.map((row) => row[index])
          );

          // chart config data if available else it will take default configs
          const chartConfig = this.isDataframeConfigDefined(
            dataframeObject.config
          )
            ? dataframeObject.config
            : dataframeObject.config && dataframeObject.config.type
            ? this.defaultChartConfig[dataframeObject.config.type]
            : this.defaultChartConfig['basic-line'];

          const { series, ...restConfigs } = chartConfig;

          // chart config data in highchart structure
          const chartDataWithConfig = this.getHighChartSeriesObject(
            dataframeObject.columns,
            chartData,
            series
          );

          // set data in object
          tmpObj = {
            ...tmpObj,
            ...restConfigs,
            chart: {
              ...tmpObj.chart,
              ...restConfigs.chart,
            },
            series: chartDataWithConfig,
          };

          tmpObj = {
            ...tmpObj,
            yAxis: {
              ...tmpObj.yAxis,
              labels: {
                ...(tmpObj.yAxis && tmpObj.yAxis.labels),
                formatter: this.getDefaultYAxisLabelFormatter(),
              },
            },
            tooltip: {
              ...tmpObj.tooltip,
              pointFormatter: this.getDefaultTooltipFormatter(),
            },
          };

          return tmpObj;
        } else if ('highchart' in this.nodeElement.value) {
          const highChartDataClone = JSON.parse(
            JSON.stringify(this.nodeElement.value.highchart)
          );

          let highchartData = {
            ...this.highChartOptions,
            ...highChartDataClone,
            chart: {
              ...this.highChartOptions.chart,
              ...highChartDataClone.chart,
            },
            legend: {
              enabled: true,
              labelFormatter: function () {
                return this.userOptions.caption || this.name;
              },
            },
          };

          if ('drilldown' in highchartData) {
            highchartData.chart = {
              ...highchartData.chart,
              events: {
                ...highchartData.chart.events,
                load: this.getLoadChartFunction(),
                drilldown: this.getSavedrillDownStateFunction(
                  highchartData,
                  this.task.input,
                  this.nodeElement.value.highchart
                ),
                drillup: this.getSavedrillDownStateFunction(
                  highchartData,
                  this.task.input,
                  this.nodeElement.value.highchart
                ),
              },
            };
          }
          if (
            this.nodeElement.value.highchart &&
            (!this.nodeElement.value.highchart.tooltip ||
              (this.nodeElement.value.highchart.tooltip &&
                !this.nodeElement.value.highchart.tooltip.pointFormatter))
          ) {
            highchartData = {
              ...highchartData,

              tooltip: {
                ...highchartData.tooltip,
                pointFormatter: this.getDefaultTooltipFormatter(),
              },
            };
          } else {
            const fnString = highChartDataClone.tooltip.pointFormatter;

            try {
              const functionaToFormatTooltip = new Function(
                'point',
                'Highcharts',
                fnString
              );

              highchartData = {
                ...highchartData,
                tooltip: {
                  ...highchartData.tooltip,
                  pointFormatter: function (point) {
                    return functionaToFormatTooltip.apply(this, [
                      point,
                      Highcharts,
                    ]);
                  },
                },
              };
            } catch (error) {
              //
            }
          }

          if (
            this.nodeElement.value.highchart &&
            (!this.nodeElement.value.highchart.yAxis ||
              (this.nodeElement.value.highchart.yAxis &&
                (!this.nodeElement.value.highchart.yAxis.labels ||
                  (this.nodeElement.value.highchart.yAxis.labels &&
                    !this.nodeElement.value.highchart.yAxis.labels.formatter))))
          ) {
            try {
              highchartData = {
                ...highchartData,

                yAxis: {
                  ...highchartData.yAxis,
                  labels: {
                    ...(highchartData.yAxis && highchartData.yAxis.labels),
                    formatter: this.getDefaultYAxisLabelFormatter(),
                  },
                },
              };
            } catch (e) {
              //
            }
          } else {
            const fnString = highChartDataClone.yAxis.labels.formatter;

            try {
              const functionToFormatLabel = new Function(
                'Highcharts',
                fnString
              );

              highchartData = {
                ...highchartData,

                yAxis: {
                  ...highchartData.yAxis,

                  labels: {
                    ...highchartData.yAxis.labels,
                    formatter: function () {
                      return functionToFormatLabel.apply(this, [Highcharts]);
                    },
                  },
                },
              };
            } catch (error) {
              //
            }
          }

          if (
            this.nodeElement.value.highchart &&
            this.nodeElement.value.highchart.xAxis
          ) {
            if (
              this.nodeElement.value.highchart.xAxis.labels &&
              this.nodeElement.value.highchart.xAxis.labels.formatter
            ) {
              try {
                const fnString = highChartDataClone.xAxis.labels.formatter;
                const functionToFormatLabel = new Function(
                  'Highcharts',
                  fnString
                );

                highchartData = {
                  ...highchartData,

                  xAxis: {
                    ...highchartData.xAxis,

                    labels: {
                      ...highchartData.xAxis.labels,
                      formatter: function () {
                        return functionToFormatLabel.apply(this, [Highcharts]);
                      },
                    },
                  },
                };
              } catch (error) {
                //
              }
            }
            if (this.nodeElement.value.highchart.xAxis.tickPositioner) {
              try {
                const fnString = highChartDataClone.xAxis.tickPositioner;
                const functionToSetTickPosition = new Function(fnString);
                highchartData = {
                  ...highchartData,
                  xAxis: {
                    ...highchartData.xAxis,

                    tickPositioner: function () {
                      return functionToSetTickPosition.apply(this);
                    },
                  },
                };
              } catch (error) {
                //
              }
            }
          }
          return highchartData;
        } else {
          // for the timeseries data
          let tmpObj = this.timeSeriesChartOptions;
          tmpObj.series[0].data = this.nodeElement.value.timeSeries.data;

          tmpObj = {
            ...tmpObj,
            yAxis: {
              ...tmpObj.yAxis,
              labels: {
                ...(tmpObj.yAxis && tmpObj.yAxis.labels),
                formatter: this.getDefaultYAxisLabelFormatter(),
              },
            },
            tooltip: {
              ...tmpObj.tooltip,
              pointFormatter: this.getDefaultTooltipFormatter(),
            },
          };
          return tmpObj;
        }
      } catch (error) {
        return this.dataframeChartOptions;
      }
    },

    isDataframeConfigDefined(config) {
      if (config) {
        const configKeys = Object.keys(config);
        return configKeys.length === 0
          ? false
          : !(configKeys.length === 1 && configKeys[0] === 'type');
      } else return false;
    },

    getHighChartSeriesObject(seriesColumns, seriesData, seriesConfig = null) {
      return seriesColumns.map((column, index) => {
        return {
          name: column,
          data: seriesData[index],
          ...(seriesConfig ? seriesConfig[index] : {}),
        };
      });
    },

    getSavedrillDownStateFunction(highchartData, taskInput, highchartElement) {
      return function () {
        setTimeout(() => {
          const drilldownState = this.series.map((series) => {
            if (series.userOptions.id && series.visible) {
              return series.userOptions.id;
            }
          });

          highchartData.customConfigs = {
            ...highchartData.customConfigs,
            drilldownState,
          };

          highchartElement.customConfigs = {
            ...highchartElement.customConfigs,
            drilldownState,
          };

          const taskInputData = taskInput.find(
            (inputVal) => inputVal.name === highchartData.customConfigs.name
          );
          taskInputData.value = {
            ...taskInputData.value,
            customConfigs: {
              ...taskInputData.value.customConfigs,
              drilldownState,
            },
          };
        });
      };
    },
    getLoadChartFunction() {
      return function () {
        this.series.forEach((series) => {
          series.points.forEach((point) => {
            if (
              this.userOptions &&
              this.userOptions.customConfigs &&
              this.userOptions.customConfigs.drilldownState &&
              this.userOptions.customConfigs.drilldownState.includes(
                point.drilldown
              )
            ) {
              point.doDrilldown();
            }
          });
        });
      };
    },
    getDefaultTooltipFormatter() {
      return function () {
        return (
          '<span style="color:' +
          this.color +
          '">\u25CF</span> ' +
          this.series.name +
          ': <b>' +
          Highcharts.numberFormat(this.y, 2, ',', '.') +
          '</b><br/>'
        );
      };
    },
    getDefaultYAxisLabelFormatter() {
      return function () {
        return Highcharts.numberFormat(this.value, 2, ',', '.');
      };
    },
  },
};
</script>
