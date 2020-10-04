///<reference path="SqlDatabase.ts"/>
/**
 * SQL上下文类。
 */
var SqlContext = /** @class */ (function () {
    /**
     * 构造函数，初始化SQL上下文。
     */
    function SqlContext() {
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
        this.standardFunctions['_len'] = function (args) {
            if (!args || args.length == 0) {
                return 0;
            }
            var s = args[0];
            if (typeof s == 'undefined' || s == null) {
                return 0;
            }
            return (s + '').length;
        };
        this.standardFunctions['_left'] = function (args) {
            if (!args || args.length == 0) {
                return '';
            }
            var s = args[0];
            if (typeof s == 'undefined' || s == null) {
                return '';
            }
            if (args.length == 1) {
                return s + '';
            }
            return (s + '').substr(0, parseInt(args[1]));
        };
        this.standardFunctions['_substr'] = function (args) {
            if (!args || args.length == 0) {
                return '';
            }
            var s = args[0];
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
        this.standardFunctions['_substring'] = function (args) {
            if (!args || args.length == 0) {
                return '';
            }
            var s = args[0];
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
        this.standardFunctions['_concat'] = function (args) {
            if (!args || args.length == 0) {
                return '';
            }
            var buf = '';
            for (var i = 0; i < args.length; i++) {
                var s = args[i];
                if (typeof s == 'undefined' || s == null) {
                    s = '';
                }
                buf += s;
            }
            return buf;
        };
        this.standardFunctions['_instr'] = function (args) {
            if (!args || args.length <= 1) {
                return 0;
            }
            var s = args[0];
            if (typeof s == 'undefined' || s == null) {
                return 0;
            }
            s = s + '';
            var s2 = args[1];
            if (typeof s2 == 'undefined' || s2 == null || s2 == '') {
                return 0;
            }
            s2 = s2 + '';
            return s.indexOf(s2);
        };
        this.standardFunctions['_ifnull'] = function (args) {
            if (!args || args.length <= 0) {
                return null;
            }
            if (args.length > 1 && (typeof args[0] == 'undefined' || args[0] == null)) {
                return args[1];
            }
            return args[0];
        };
    }
    return SqlContext;
}());
