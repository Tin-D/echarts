<template>
    <el-dialog modal
               :close-on-click-modal="false"
               modal-append-to-body
               :visible="true"
               @close="handleClose"
               title="任务详情"
               :fullscreen="!isCreate"
    >
        <el-form ref="form"
                 size="mini"
                 label-position="left"
                 :rules="rules"
                 :model="form"
                 :inline="true"
        >

            <el-form-item label="名称:" prop="name">
                <el-input v-model="form.name" :disabled="!isCreate"/>
            </el-form-item>

            <el-form-item label="端口:" prop="portName" style="margin-right: 20px">
                <el-select v-model="form.portName" v-if="isCreate">
                    <el-option v-for="p of ports" :key="p" :label="p" :value="p"/>
                </el-select>
                <span v-else>{{ form.portName }}</span>
            </el-form-item>

            <el-form-item label="波特率:" prop="baudRate">
                <el-input v-model="form.baudRate" type="number" :disabled="!isCreate"/>
            </el-form-item>

            <el-form-item label="运行时常(分钟):" prop="runTime">
                <el-input-number v-model.number="form.runTime" :min="0" :disabled="!isCreate"/>
                <strong style="margin-left: 5px">0代表不设置定时停止</strong>
            </el-form-item>

            <el-form-item label="采集间隔(秒):" prop="interval">
                <el-input-number v-model.number="form.interval" :min="1" :disabled="!isCreate"/>
            </el-form-item>

        </el-form>

        <battery-voltage-view v-if="job" :voltages="job.lastReportData" :last-report-time="job.lastReportTime"
                              :id="id"/>

        <div slot="footer" class="dialog-footer" v-if="isCreate">
            <el-button size="mini" type="primary" @click="handleSubmit">保存并运行任务</el-button>
        </div>

    </el-dialog>
</template>

<script>
    import * as validators from '@/roadhog/validators';
    import { actionTypes } from '@/store/actionTypes';
    import BatteryVoltageView from '@/components/job/BatteryVoltageView';

    export default {
        components: { BatteryVoltageView },
        created () {
            if (this.isCreate) {
                this.$store.dispatch(actionTypes.listComPorts);
            } else {
                Object.assign(this.form, this.job.jobInfo);
            }
        },
        data () {
            return {
                form: {
                    name: null,
                    portName: null,
                    runTime: 0,
                    baudRate: 115200,
                    interval: 1,
                    jobType: 'MeasureVoltage',
                },
                rules: {
                    name: [validators.required()],
                    portName: [validators.required()],
                },
            };
        },
        computed: {
            ports () {
                return this.$store.state.ports;
            },
            job () {
                if (!this.isCreate) {
                    return this.$store.state.jobs.find(i => i.id === this.id);
                }
                return null;
            },
            isCreate () {
                return this.id == null;
            },
        },
        methods: {
            async handleSubmit () {
                await this.$refs.form.validate();
                await this.$store.dispatch(actionTypes.saveAndStartJob, this.form);
                this.$emit('close');
            },
            handleClose () {
                this.$emit('close');
            },
        },
        props: {
            id: {
                type: String,
            },
        },
    };
</script>
