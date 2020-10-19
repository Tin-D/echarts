<template>
    <div>
        <page-header/>

        <el-table :data="finishJobs"
                  border
                  stripe
                  :default-sort="{prop: 'startTime', order: 'descending'}"
        >

            <el-table-column type="index"/>

            <el-table-column label="名称" prop="name" sortable/>

            <el-table-column label="类型" prop="jobType" sortable/>

            <el-table-column label="端口名称" prop="portName" sortable/>

            <el-table-column label="运行时间" prop="runTime"/>

            <el-table-column label="开始时间" :formatter="renderDateTimeRow" prop="startTime"/>

            <el-table-column label="结束时间" :formatter="renderDateTimeRow" prop="finishTime"/>

            <el-table-column label="操作">
                <template slot-scope="{ row }">
                    <el-button size="mini" type="primary" @click="handleDownload(row)">下载</el-button>
                    <el-button size="mini" type="danger" @click="handleRemove(row)">删除</el-button>
                </template>
            </el-table-column>

        </el-table>
    </div>
</template>

<script>
    import dayjs from 'dayjs';
    import PageHeader from '@/components/PageHeader';
    import { actionTypes } from '@/store/actionTypes';
    import { confirmDialog } from '@/roadhog/alert';

    export default {
        components: { PageHeader },
        created () {
            this.load();
        },
        computed: {
            finishJobs () {
                return this.$store.state.finishJobs;
            },
        },
        methods: {
            load () {
                this.$store.dispatch(actionTypes.getFinishJobs);
            },
            async handleDownload (file) {
                await this.$store.dispatch(actionTypes.download, { id: file.id });
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
            async handleRemove (row) {
                await confirmDialog({ message: '相关任务数据也会被同时删除，确定' });
                await this.$store.dispatch(actionTypes.removeFinishJob, row.id);
                this.load();
            },
        },
    };
</script>
