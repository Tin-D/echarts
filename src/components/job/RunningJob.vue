<template>
    <div>
        <page-header/>

        <el-form size="mini" inline>
            <el-form-item>
                <el-button type="primary" @click="JobEditorDialog.handleAdd">创建任务</el-button>
            </el-form-item>
        </el-form>

        <el-table :data="jobs"
                  border
                  stripe
                  :default-sort="{prop: 'startTime', order: 'descending'}"
        >

            <el-table-column type="index"/>

            <el-table-column label="名称" prop="name" sortable>
                <template slot-scope="{ row }">
                    <el-button type="text" @click="JobEditorDialog.handleEdit(row)">{{ row.name }}</el-button>
                </template>
            </el-table-column>

            <el-table-column label="开始时间" prop="jobInfo.startTime" :formatter="renderDateTimeRow" sortable/>

            <el-table-column label="结束时间" prop="jobInfo.finishTime" :formatter="renderDateTimeRow" sortable/>

            <el-table-column label="设定时常(分钟)" prop="jobInfo.runTime"/>

            <el-table-column label="采集间隔(秒)" prop="jobInfo.interval"/>

            <el-table-column label="状态">
                <template slot-scope="{ row }">
                    {{ row.jobInfo.finishTime ? '已停止' : '运行中' }}
                </template>
            </el-table-column>

            <el-table-column label="操作">
                <template slot-scope="{ row }">
                    <el-button size="mini" type="primary" @click="JobEditorDialog.handleStop(row)" :disabled="row.jobInfo.finishTime != null">停止</el-button>
                    <el-button size="mini" type="danger" @click="JobEditorDialog.handleRemove(row)">删除</el-button>
                </template>
            </el-table-column>

        </el-table>

        <job-editor v-if="JobEditorDialog.show"
                    @close="JobEditorDialog.handleClose"
                    :id="JobEditorDialog.id"
        />
    </div>
</template>

<script>
    import dayjs from 'dayjs';
    import PageHeader from '@/components/PageHeader';
    import JobEditor from '@/components/job/JobEditor';
    import { actionTypes } from '@/store/actionTypes';
    import { confirmDialog } from '@/roadhog/alert';

    export default {
        components: { PageHeader, JobEditor },
        created () {
            this.load();
        },
        data () {
            return {
                JobEditorDialog: {
                    show: false,
                    id: null,
                    handleClose: () => {
                        this.JobEditorDialog.show = false;
                        this.JobEditorDialog.id = null;
                    },
                    handleAdd: () => {
                        this.JobEditorDialog.show = true;
                        this.JobEditorDialog.id = null;
                    },
                    handleEdit: async (row) => {
                        this.JobEditorDialog.show = true;
                        this.JobEditorDialog.id = row.id;
                    },
                    handleRemove: async (row) => {
                        await confirmDialog({ message: '相关任务数据也会被同时删除，确定' });
                        await this.$store.dispatch(actionTypes.removeJob, row.id);
                    },
                    handleStop: async (row) => {
                        await confirmDialog({ message: '停止后不能重新启动，确定' });
                        await this.$store.dispatch(actionTypes.stopJob, row.id);
                    },
                },
                intervalId: null,
            };
        },
        computed: {
            jobs () {
                return this.$store.state.jobs;
            },
        },
        beforeDestroy () {
            if (this.intervalId) {
                clearInterval(this.intervalId);
            }
        },
        methods: {
            load () {
                this.$store.dispatch(actionTypes.listRunningJobs);
                this.intervalId = setInterval(() => {
                    this.$store.dispatch(actionTypes.listRunningJobs);
                }, 2000);
            },
            renderDateTimeRow (row, column) {
                const value = _.get(row, column.property);
                return this.renderDateTime(value);
            },
            renderDateTime (value, defaultValue = null) {
                if (!value) {
                    return defaultValue;
                }
                return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
            },
        },
    };
</script>
