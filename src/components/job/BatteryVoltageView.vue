<template>
    <div v-loading="loading"
         element-loading-text="正在加载中"
         element-loading-spinner="el-icon-loading"
         element-loading-background="rgba(0, 0, 0, 0.8)">
        <div>
            <span style="margin-right: 30px;">更新时间: {{ renderDateTime(lastReportTime) }}</span>
            <span style="margin-right: 30px;">总电压: {{ voltagesSum }}</span>
            <span>平均电压: {{averageVoltage}}</span>
            <span style="margin-left: 20px;"><el-tag type="success">高于平均电压</el-tag> <el-tag type="warning">低于平均电压</el-tag></span>
        </div>
        <el-row :gutter="10">
            <el-col :span="3" v-for="(v, index) of newVoltages" :key="index" style="margin-top: 10px;">
                <div class="battery-voltage" :style="'border-color:' +
                (index===newVoltages.length-1  ? '#921f1f' : '' ||
                v.num === 0 ? 'black' : '' ||
                v.num < 0 ? '#f56c6c' : '' ||
                (v.num / 1000) < averageVoltage ? '#e6a23c' : '' ||
                (v.num / 1000) > averageVoltage ? '#67c23a' : '') + ';' +  'color:' + (index===newVoltages.length-1  ? 'black' : '' ||
                v.num === 0 ? 'black' : '' || v.num < 0 ? '#f56c6c' : '' ||
                (v.num / 1000) < averageVoltage ? '#e6a23c' : '' ||
                (v.num / 1000) > averageVoltage ? '#67c23a' : '') + ';' "
                     @click="batteryEcharts(index)">
                    <div v-for="(o, index1) of oldVoltages" :key="index1">
                        <div v-if="index === index1 && (v.num / 1000).toFixed(2) > (o / 1000).toFixed(2) ? v.top = true : '' "></div>
                        <div v-if="index === index1 && (v.num / 1000).toFixed(2) < (o / 1000).toFixed(2) ? v.bottom = true : '' "></div>
                    </div>
                    <div v-if="index===newVoltages.length-1" :style="'color:#921f1f'">电流</div>
                    <div v-else>{{ index + 1 }}号电池</div>
                    <hr :style="'border-color:' + (index===newVoltages.length-1  ? '#921f1f' : '' ||
                    v.num === 0 ? 'black' : '' ||
                    v.num < 0 ? '#f56c6c' : '' ||
                    (v.num / 1000) < averageVoltage ? '#e6a23c' : '' ||
                    (v.num / 1000) > averageVoltage ? '#67c23a' : '') + ';'"/>
                    <div class="tip" style="font-size: 16px;">
                        <strong>{{ index !== 39 ? (v.num / 1000).toFixed(1) : null }}</strong>
                        <strong :style="'color:#921f1f'">{{ index === 39 ? (v.num / 1000).toFixed(1) : null }}</strong>

                        <i class="el-icon-top" v-if="v.top"></i><i class="el-icon-bottom" v-if="v.bottom"></i>
                    </div>
                </div>
            </el-col>
        </el-row>
        <echart-dialog v-if="EchartDialog.show"
                       @close="EchartDialog.handleClose"
                       :index="index"
                       :id="id"
        />
        <current-echart-dialog v-if="CurrnetEchartDialog.show"
                               @close="CurrnetEchartDialog.handleClose"
                               :index="index"
                               :id="id"
        />
    </div>
</template>

<script>
    import dayjs from 'dayjs';
    import EchartDialog from '@/components/job/EchartDialog.vue';
    import CurrentEchartDialog from '@/components/job/CurrentEchartDialog.vue';

    export default {
        components: { EchartDialog, CurrentEchartDialog },
        filters: {
            rounding (value) {
                return (value / 1000).toFixed(2);
            },
        },
        data () {
            return {
                auto: 0,
                index: null,
                voltagesSum: 0,
                averageVoltage: 0,
                oldVoltages: [],
                newVoltages: [],
                top: false,
                bottom: false,
                loading: true,
                EchartDialog: {
                    show: false,
                    handleOpen: () => {
                        this.EchartDialog.show = true;
                    },
                    handleClose: () => {
                        this.EchartDialog.show = false;
                        this.EchartDialog.index = null;
                    },
                },
                CurrnetEchartDialog: {
                    show: false,
                    handleOpen: () => {
                        this.CurrnetEchartDialog.show = true;
                    },
                    handleClose: () => {
                        this.CurrnetEchartDialog.show = false;
                        this.CurrnetEchartDialog.index = null;
                    },
                },
            };
        },
        watch: {
            voltages: {
                handler (newVal, oldVal) {
                    if (newVal) {
                        this.auto += 1;
                        this.loading = false;
                        this.voltagesSum = 0;
                        this.averageVoltage = 0;
                        this.newVoltages = [];
                        const averageVoltage = [];
                        newVal.map((item, index) => {
                            this.newVoltages.push({ num: item, top: false, bottom: false });
                            if (item > 0 && index !== 39) {
                                averageVoltage.push(item);
                                this.voltagesSum += item;
                            }
                        });
                        this.voltagesSum = (this.voltagesSum / 1000).toFixed(2);
                        this.averageVoltage = (this.voltagesSum / averageVoltage.length).toFixed(2);
                    }
                    if (oldVal) {
                        this.oldVoltages = oldVal;
                    }
                },
            },
        },
        methods: {
            batteryEcharts (index) {
                if (index === 39) {
                    this.index = index + 1;
                    this.CurrnetEchartDialog.handleOpen();
                } else {
                    this.index = index + 1;
                    this.EchartDialog.handleOpen();
                }
            },
            renderDateTime (value, defaultValue = null) {
                if (!value) {
                    return defaultValue;
                }
                return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
            },
        },
        props: {
            voltages: {
                type: Array,
                required: true,
            },
            lastReportTime: {
                type: String,
            },
            id: {
                type: String,
                required: true,
            },
        },
    };
</script>
