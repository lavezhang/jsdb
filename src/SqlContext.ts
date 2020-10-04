///<reference path="SqlDatabase.ts"/>
/**
 * SQL上下文类。
 */
class SqlContext {

    /**
     * 构造函数，初始化SQL上下文。
     */
    constructor() {
        this.database = new SqlDatabase();
        this.dataTable = null;
        this.rowIndex = -1;
        this.parameters = [];
        this.holdIndex = -1;
        this.tableAliasMap = [];
        this.selectNode = null;
        this.groupByMidTable = null;
        this.isGroupByMidTableFinished = false;
        this.standardFunctions = [];

        this.standardFunctions['_len'] = function (args: any[]) {
            if (!args || args.length == 0) {
                return 0;
            }
            let s = args[0];
            if (typeof s == 'undefined' || s == null) {
                return 0;
            }
            return (s + '').length;
        };
        this.standardFunctions['_left'] = function (args: any[]) {
            if (!args || args.length == 0) {
                return '';
            }
            let s = args[0];
            if (typeof s == 'undefined' || s == null) {
                return '';
            }
            if (args.length == 1) {
                return s + '';
            }
            return (s + '').substr(0, parseInt(args[1]));
        };
        this.standardFunctions['_substr'] = function (args: any[]) {
            if (!args || args.length == 0) {
                return '';
            }
            let s = args[0];
            if (typeof s == 'undefined' || s == null) {
                return '';
            }
            if (args.length == 1) {
                return s + '';
            }
            if (args.length == 2) {
                return (s + '').substr(parseInt(args[1]));
            }
            return (s + '').substr(parseInt(args[1]), parseInt(args[2]));
        };
        this.standardFunctions['_substring'] = function (args: any[]) {
            if (!args || args.length == 0) {
                return '';
            }
            let s = args[0];
            if (typeof s == 'undefined' || s == null) {
                return '';
            }
            if (args.length == 1) {
                return s + '';
            }
            if (args.length == 2) {
                return (s + '').substr(parseInt(args[1]));
            }
            return (s + '').substring(parseInt(args[1]), parseInt(args[2]));
        };
        this.standardFunctions['_concat'] = function (args: any[]) {
            if (!args || args.length == 0) {
                return '';
            }
            let buf = '';
            for (let i = 0; i < args.length; i++) {
                let s = args[i];
                if (typeof s == 'undefined' || s == null) {
                    s = '';
                }
                buf += s;
            }
            return buf;
        };
        this.standardFunctions['_instr'] = function (args: any[]) {
            if (!args || args.length <= 1) {
                return 0;
            }

            let s = args[0];
            if (typeof s == 'undefined' || s == null) {
                return 0;
            }
            s = s + '';

            let s2 = args[1];
            if (typeof s2 == 'undefined' || s2 == null || s2 == '') {
                return 0;
            }
            s2 = s2 + '';

            return s.indexOf(s2);
        };
        this.standardFunctions['_ifnull'] = function (args: any[]) {
            if (!args || args.length <= 0) {
                return null;
            }
            if (args.length > 1 && (typeof args[0] == 'undefined' || args[0] == null)) {
                return args[1];
            }
            return args[0];
        };
    }

    /**
     * 当前数据库。
     */
    public database: SqlDatabase;
    /**
     * 当前数据表。
     */
    public dataTable: SqlDataTable;
    /**
     * 当前数据行。
     */
    public rowIndex: number;
    /**
     * 当前动态参数。
     */
    public parameters: any[];
    /**
     * 当前占位符索引号。
     */
    public holdIndex: number;

    /**
     * 表的别名到真名的映射关系。
     */
    public tableAliasMap: string[];

    /**
     * 当前执行的select节点。
     */
    public selectNode: SqlSelectNode;

    /**
     * 分组计算的中间表。
     */
    public groupByMidTable: SqlDataTable;

    /**
     * 分组计算的中间表是否已完成。
     */
    public isGroupByMidTableFinished: boolean;

    /**
     * 当前支持的标准函数。
     */
    public standardFunctions: any[];
}