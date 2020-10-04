var TK_START = 0; //起始
var TK_ERROR = 1; //错误
var TK_IDENTITY = 7; //标识符（下划线当作字母处理）
var TK_INT = 8; //整数（不支持科学计数法）
var TK_FLOAT = 9; //浮点数（不支持科学计数法）
var TK_GT = 10; //操作符：大于 >
var TK_LT = 11; //操作符：小于 <
var TK_GE = 12; //操作符：大于等于 >=
var TK_LE = 13; //操作符：小于等于 <=
var TK_EQ = 14; //操作符：等于 =
var TK_NE = 15; //操作符：不等于 <>
var TK_ADD = 16; //操作符：加 +
var TK_SUB = 17; //操作符：减 -
var TK_MUL = 18; //操作符：乘 *
var TK_DIV = 19; //操作符：除 /
var TK_MOD = 20; //操作符：模（取余） %
var TK_MOVE_LEFT = 21; //操作符：左移 <<
var TK_MOVE_RIGHT = 22; //操作符：右移 >>
var TK_DOT = 23; //分隔符：点 .
var TK_OPEN_PAREN = 24; //分隔符：左圆括号 (
var TK_CLOSE_PAREN = 25; //分隔符：右圆括号 )
var TK_COMMA = 26; //分隔符：逗号 ,
var TK_HOLD = 27; //占位符 ?
var TK_COMMENT = 28; //注释 /**/
var TK_STRING = 29; //字符串  'abc'
var TK_SELECT = 50; //关键字：select
var TK_FROM = 51; //关键字：from
var TK_WHERE = 52; //关键字：where
var TK_AS = 53; //关键字：as
var TK_DISTINCT = 54; //关键字：distinct
var TK_LEFT = 55; //关键字：left
var TK_JOIN = 56; //关键字：join
var TK_ON = 57; //关键字：on
var TK_CASE = 58; //关键字：case
var TK_WHEN = 59; //关键字：when
var TK_THEN = 60; //关键字：then
var TK_ELSE = 61; //关键字：else
var TK_END = 62; //关键字：end
var TK_IS = 63; //关键字：is
var TK_NOT = 64; //关键字：not
var TK_NULL = 65; //关键字：null
var TK_TRUE = 66; //关键字：true
var TK_FALSE = 67; //关键字：false
var TK_AND = 68; //关键字：and
var TK_OR = 69; //关键字：or
var TK_BETWEEN = 70; //关键字：between
var TK_IN = 71; //关键字：in
var TK_LIKE = 72; //关键字：like
var TK_GROUP = 73; //关键字：group
var TK_BY = 74; //关键字：by
var TK_HAVING = 75; //关键字：having
var TK_ORDER = 76; //关键字：order
var TK_ASC = 77; //关键字：asc
var TK_DESC = 78; //关键字：desc
var TK_LIMIT = 79; //关键字：limit
var TK_INSERT = 80; //关键字：insert
var TK_INTO = 81; //关键字：into
var TK_VALUES = 82; //关键字：values
var TK_UPDATE = 83; //关键字：update
var TK_SET = 84; //关键字：set
var TK_DELETE = 85; //关键字：delete
var TK_CREATE = 86; //关键字：create
var TK_TABLE = 87; //关键字：table
/**
 * 词法状态流转图。
 * 详见：lex_state_flow.xlsx 文件。
 */
var STATE_FLOW_TABLE = [
    [0, 0, 8, 7, 1, 4, 1, 16, 17, 18, 19, 20, 10, 11, 14, 24, 25, 26, 27, 1],
    [0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-2, -2, -2, -2, -2, -2, -2, -2, -2, -3, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2],
    [-2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -28, -2, -2, -2, -2, -2, -2, -2, -2, -2],
    [-5, -1, -5, -5, -5, -29, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5],
    [-5, -1, -5, -5, -5, -29, -6, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5],
    [-5, -1, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5],
    [0, 0, -7, -7, 23, -1, -1, 16, 17, 18, 19, 20, 10, 11, 14, 24, 25, 26, 27, -1],
    [0, 0, -8, -1, -9, -1, -1, 16, 17, 18, 19, 20, 10, 11, 14, 24, 25, 26, 27, -1],
    [0, 0, -9, -1, -1, -1, -1, 16, 17, 18, 19, 20, 10, 11, 14, 24, 25, 26, 27, -1],
    [0, 0, 8, 7, -1, 4, -1, 16, 17, -1, 19, -1, -22, -1, -12, 24, -1, -1, 27, -1],
    [0, 0, 8, 7, -1, 4, -1, 16, 17, -1, 19, -1, -15, -21, -13, 24, -1, -1, 27, -1],
    [0, 0, 8, 7, -1, 4, -1, 16, 17, -1, 19, -1, -1, -1, -1, 24, -1, -1, 27, -1],
    [0, 0, 8, 7, -1, 4, -1, 16, 17, -1, 19, -1, -1, -1, -1, 24, -1, -1, 27, -1],
    [0, 0, 8, 7, -1, 4, -1, 16, 17, -1, 19, -1, -1, -1, -1, 24, -1, -1, 27, -1],
    [0, 0, 8, 7, -1, 4, -1, 16, 17, -1, 19, -1, -1, -1, -1, 24, -1, -1, 27, -1],
    [0, 0, 8, 7, -1, 4, -1, 16, 17, -1, 19, -1, -1, -1, -1, 24, -1, -1, 27, -1],
    [0, 0, 8, 7, -1, -1, -1, 16, 17, -1, 19, -1, -1, -1, -1, 24, -1, -1, 27, -1],
    [0, 0, 8, 7, -1, -1, -1, 16, 17, -1, -1, -1, -1, -1, -1, 24, 25, 26, 27, -1],
    [0, 0, 8, 7, -1, -1, -1, 16, 17, -2, 19, -1, -1, -1, -1, 24, -1, -1, 27, -1],
    [0, 0, 8, 7, -1, -1, -1, 16, 17, -1, 19, -1, -1, -1, -1, 24, -1, -1, 27, -1],
    [0, 0, 8, 7, -1, -1, -1, 16, 17, -1, 19, -1, -1, -1, -1, 24, -1, -1, 27, -1],
    [0, 0, 8, 7, -1, -1, -1, 16, 17, -1, 19, -1, -1, -1, -1, 24, -1, -1, 27, -1],
    [0, 0, 1, 7, -1, -1, -1, -1, -1, 18, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [0, 0, 8, 7, -1, 4, -1, 16, 17, 18, -1, -1, -1, -1, -1, 24, 25, -1, 27, -1],
    [0, 0, 1, 7, -1, -1, -1, 16, 17, 18, 19, 20, 10, 11, 14, 24, 25, 26, -1, -1],
    [0, 0, 8, 7, -1, 4, -1, 16, 17, -1, -1, -1, -1, -1, -1, 24, -1, -1, 27, -1],
    [0, 0, 1, -1, -1, -1, -1, 16, 17, 18, 19, 20, 10, 11, 14, -1, 25, 26, -1, -1],
    [0, 0, 8, 7, -1, 4, -1, 16, 17, 18, 19, 20, 10, 11, 14, 24, 25, 26, 27, -1],
    [0, 0, 1, 7, -1, -1, -1, 16, -1, -1, 19, -1, 10, 11, 14, -1, 25, 26, -1, -1]
];
/**
 * SQL词法分析类。
 */
var SqlLexer = /** @class */ (function () {
    function SqlLexer() {
    }
    /**
     * 扫描指定的SQL语句，返回所有单词。
     * 用一个元组来表示单词的三个字段：类型（状态）、内容、行号（从1开始）。
     * @param sql 要扫描的SQL语句。
     */
    SqlLexer.prototype.scan = function (sql) {
        var tokens = new Array();
        var pos = 0;
        var len = sql.length;
        var buf = '';
        var c = '';
        var j = 0;
        var state = TK_START;
        var beginLine = 1;
        var totalLine = 1;
        while (pos < len) {
            c = sql[pos++];
            if (c == ' ' || c == '\t' || c == '\r') {
                j = 0;
            }
            else if (c == '\n') {
                j = 1;
            }
            else if (c >= '0' && c <= '9') {
                j = 2;
            }
            else if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_') {
                j = 3;
            }
            else if (c == '.') {
                j = 4;
            }
            else if (c == '\'') {
                j = 5;
            }
            else if (c == '\\') {
                j = 6;
            }
            else if (c == '+') {
                j = 7;
            }
            else if (c == '-') {
                j = 8;
            }
            else if (c == '*') {
                j = 9;
            }
            else if (c == '/') {
                j = 10;
            }
            else if (c == '%') {
                j = 11;
            }
            else if (c == '>') {
                j = 12;
            }
            else if (c == '<') {
                j = 13;
            }
            else if (c == '=') {
                j = 14;
            }
            else if (c == '(') {
                j = 15;
            }
            else if (c == ')') {
                j = 16;
            }
            else if (c == ',') {
                j = 17;
            }
            else if (c == '?') {
                j = 18;
            }
            else {
                j = 19;
            }
            //如果新状态的值小于0，表示带着当前缓存区的内容，直接转换到新的状态；
            //如果新状态的值大于等于0，则用当前缓冲区的内容构造一个旧状态的单词，然后从当前字符开始进入新的状态。
            var nextState = STATE_FLOW_TABLE[state][j];
            if (nextState < 0) {
                buf += c;
            }
            else {
                var token = this.newToken(state, buf, beginLine);
                if (token) {
                    tokens.push(token);
                    beginLine = totalLine;
                }
                buf = j > 1 ? c : '';
                if (c == '\n') {
                    beginLine++;
                }
            }
            state = Math.abs(nextState);
            //处理最后一个单词
            if (pos >= len) {
                var token = this.newToken(state, buf, beginLine);
                if (token) {
                    tokens.push(token);
                    beginLine = totalLine;
                }
            }
            else if (c == '\n') {
                totalLine++;
            }
        }
        return tokens;
    };
    SqlLexer.prototype.newToken = function (state, value, line) {
        if (value.length <= 0) {
            return null;
        }
        if (state == TK_IDENTITY) {
            value = value.toLowerCase();
            switch (value) {
                case 'select':
                    state = TK_SELECT;
                    break;
                case 'from':
                    state = TK_FROM;
                    break;
                case 'where':
                    state = TK_WHERE;
                    break;
                case 'as':
                    state = TK_AS;
                    break;
                case 'distinct':
                    state = TK_DISTINCT;
                    break;
                case 'left':
                    state = TK_LEFT;
                    break;
                case 'join':
                    state = TK_JOIN;
                    break;
                case 'on':
                    state = TK_ON;
                    break;
                case 'case':
                    state = TK_CASE;
                    break;
                case 'when':
                    state = TK_WHEN;
                    break;
                case 'then':
                    state = TK_THEN;
                    break;
                case 'else':
                    state = TK_ELSE;
                    break;
                case 'end':
                    state = TK_END;
                    break;
                case 'is':
                    state = TK_IS;
                    break;
                case 'not':
                    state = TK_NOT;
                    break;
                case 'null':
                    state = TK_NULL;
                    break;
                case 'true':
                    state = TK_TRUE;
                    break;
                case 'false':
                    state = TK_FALSE;
                    break;
                case 'and':
                    state = TK_AND;
                    break;
                case 'or':
                    state = TK_OR;
                    break;
                case 'between':
                    state = TK_BETWEEN;
                    break;
                case 'in':
                    state = TK_IN;
                    break;
                case 'like':
                    state = TK_LIKE;
                    break;
                case 'group':
                    state = TK_GROUP;
                    break;
                case 'by':
                    state = TK_BY;
                    break;
                case 'having':
                    state = TK_HAVING;
                    break;
                case 'order':
                    state = TK_ORDER;
                    break;
                case 'asc':
                    state = TK_ASC;
                    break;
                case 'desc':
                    state = TK_DESC;
                    break;
                case 'limit':
                    state = TK_LIMIT;
                    break;
                case 'insert':
                    state = TK_INSERT;
                    break;
                case 'into':
                    state = TK_INTO;
                    break;
                case 'values':
                    state = TK_VALUES;
                    break;
                case 'update':
                    state = TK_UPDATE;
                    break;
                case 'set':
                    state = TK_SET;
                    break;
                case 'delete':
                    state = TK_DELETE;
                    break;
                case 'create':
                    state = TK_CREATE;
                    break;
                case 'table':
                    state = TK_TABLE;
                    break;
                default:
                    break;
            }
        }
        else if (state > TK_ERROR && state < TK_IDENTITY) { //无效字符
            state = TK_ERROR;
        }
        return [state, value, line];
    };
    return SqlLexer;
}());
