<template>
    <el-dialog
            title="电流"
            :visible.sync="dialogVisible"
            @close="handleClose"
            :append-to-body="true"
            fullscreen
            width="30%">
        <el-row>
            <div id="myChart1" style="width: 100%;height:400px;"></div>
            <ve-line :data="chartData"></ve-line>
        </el-row>
    </el-dialog>
</template>

<script>
    import echarts from 'echarts';
    import { actionTypes } from '@/store/actionTypes';

    export default {
        async created () {
            this.refrigerationLine();
            this.intervalId = setInterval(() => {
                this.refrigerationLine();
            }, this.second());
        },
        data () {
            return {
                intervalId: null,
                dialogVisible: true,
                chartData: {
                    columns: ['createTime', '电流'],
                    rows: [],
                },
                refrigeration: {
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 0),
                    },
                    title: {
                        text: '电流-时间',
                    },
                    dataZoom: [{
                        type: 'slider',
                        show: true,
                        xAxisIndex: [0],
                        bottom: 0,
                        start: 0,
                        end: 100,
                    }, {
                        type: 'inside',
                    }],
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            label: {
                                backgroundColor: '#6a7985',
                            },
                        },
                        formatter: (params) => {
                            let res = params[0].axisValue; // 第一组数据的时间
                            for (let i = 0; i < params.length; i++) {
                                res += '<div><span class="circle" style="background:' + params[i].color + ';"></span>' + '<span>' + params[i].seriesName + ':' + params[i].data + ' V</span></div>';
                            }
                            return res;
                        },
                    },
                    legend: {
                        data: ['电流'],
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            dataView: { readOnly: true },
                            restore: {},
                            saveAsImage: {},
                            myFull: {
                                show: true,
                                title: '全屏查看',
                                icon: 'M1014.237213 1013.761259a28.517906 28.517906 0 0 1-22.344547 10.118285h-287.979654a32.011123 32.011123 0 0 1 0-63.962019l210.345905 0.963647-345.105808-345.135922 45.201031-45.261259 345.527403 345.527403v-212.062399a31.981009 31.981009 0 1 1 63.962019 0L1023.90379 990.965003c0 8.973956-3.764243 16.984265-9.666577 22.796256z m-22.344547-661.753938a31.981009 31.981009 0 0 1-32.011123-32.011123l1.023874-210.345904-345.196149 345.105807-45.201032-45.261259L915.975411 64.027667h-212.062399a32.011123 32.011123 0 0 1 0-64.022246h287.076236c8.913728 0 16.984265 3.764243 22.796256 9.666576a28.608248 28.608248 0 0 1 10.058058 22.344547v287.979654c0 17.676886-14.334238 32.011123-31.950896 32.011123z m-582.373579 101.393653L63.991685 107.873571v212.122627a32.011123 32.011123 0 1 1-63.962019 0V32.919962C0.029666 24.006235 3.733681 15.935697 9.636014 10.123706A28.578134 28.578134 0 0 1 32.040789 0.005421h287.919427a32.011123 32.011123 0 0 1 0 64.022246l-210.345905-1.023874 345.166036 345.196149-45.26126 45.201032zM32.040789 671.937871c17.616658 0 31.950895 14.334238 31.950896 32.011124l-0.963647 210.345904 345.135922-345.166035 45.261259 45.261259L107.897816 959.917525h212.0624a31.981009 31.981009 0 1 1 0 63.962019H32.944208c-8.973956 0-16.984265-3.704015-22.796257-9.606348A28.668475 28.668475 0 0 1 0.029666 991.868421v-287.919426c0-17.676886 14.334238-32.011123 32.011123-32.011124z',
                                onclick: (e) => {
                                    console.log(e.option);
                                    const element = document.getElementById(e.option.value);
                                    if (element.requestFullscreen) { // HTML W3C 提议
                                        element.requestFullscreen();
                                    } else if (element.msRequestFullscreen) { // IE11
                                        element.msRequestFullscreen();
                                    } else if (element.webkitRequestFullScreen) { // Webkit (works in Safari5.1 and Chrome 15)
                                        element.webkitRequestFullScreen();
                                    } else if (element.mozRequestFullScreen) { // Firefox (works in nightly)
                                        element.mozRequestFullScreen();
                                    }
                                    // 退出全屏
                                    if (element.exitFullscreen) {
                                        document.exitFullscreen();
                                    } else if (element.msExitFullscreen) {
                                        document.msExitFullscreen();
                                    } else if (element.webkitRequestFullScreen) {
                                        document.webkitCancelFullScreen();
                                    } else if (element.mozCancelFullScreen) {
                                        document.mozCancelFullScreen();
                                    }
                                },
                            },
                        },
                    },
                    grid: {
                        left: '5%',
                        right: '6%',
                        bottom: '3%',
                        containLabel: true,
                    },
                    xAxis: {
                        name: '时间',
                        type: 'category',
                        boundaryGap: false,
                        data: [],
                    },
                    yAxis: {
                        name: '电流（A）',
                        axisLabel: {
                            formatter: '{value}(A)',
                        },
                        type: 'value',
                    },
                    series: [
                        {
                            name: '电流',
                            type: 'line',
                            areaStyle: {},
                            smooth: true,
                            data: [],
                        },
                    ],
                },
            };
        },
        methods: {
            second () {
                if (this.$parent.$parent.$parent.job.jobInfo.interval) {
                    return this.$parent.$parent.$parent.job.jobInfo.interval * 1000;
                } else {
                    return 10000;
                }
            },
            handleClose () {
                this.$emit('close');
            },
            async refrigerationLine () {
                const res = await this.$store.dispatch(actionTypes.currentEcharts, { id: this.id, index: this.index });

                this.refrigeration.series[0].data = [];
                this.chartData.rows = [];
                this.refrigeration.xAxis.data = [];
                res.forEach((i) => {
                    this.refrigeration.series[0].data.push(i['电流']);
                    this.refrigeration.xAxis.data.push(i.createTime);
                    this.chartData.rows.push(i);
                });

                this.$nextTick(() => {
                    let myChart = echarts.init(document.getElementById('myChart1'));
                    myChart.on('dataZoom', (event) => {
                        if (event.batch) {
                            // 鼠标滚轮缩放
                            this.dataZoom = {
                                start: event.batch[0].start,
                                end: event.batch[0].end,
                            };
                            this.refrigeration.dataZoom[0].start = this.dataZoom.start;
                            this.refrigeration.dataZoom[0].end = this.dataZoom.end;
                        } else {
                            // 滑块缩放
                            this.dataZoom = {
                                start: event.start,
                                end: event.end,
                            };
                            this.refrigeration.dataZoom[0].start = this.dataZoom.start;
                            this.refrigeration.dataZoom[0].end = this.dataZoom.end;
                        }
                    });
                    myChart.setOption(this.refrigeration);
                    myChart.setOption({ value: 'myChart1' });

                    // 浏览器宽高变化，erhart's图表自动变化
                    window.addEventListener('resize', function () {
                        myChart.resize();
                    });
                });
            },
        },
        beforeDestroy () {
            if (this.intervalId) {
                clearInterval(this.intervalId);
            }
        },
        props: {
            index: {
                type: Number,
                required: true,
            },
            id: {
                type: String,
                required: true,
            },
        },
    };
</script>

<style>
    :-webkit-full-screen {
        background-color: white !important;
    }
    :-moz-full-screen {
        background-color: white !important;
    }

    :-ms-fullscreen {
        background-color: white !important;
    }
    :fullscreen {
        background-color: white !important;
    }
</style>
