///<reference path="SqlLexer.ts"/>
///<reference path="SqlError.ts"/>
///<reference path="ast/SqlNode.ts"/>
///<reference path="ast/SqlNullNode.ts"/>
///<reference path="ast/SqlBoolNode.ts"/>
///<reference path="ast/SqlNumberNode.ts"/>
///<reference path="ast/SqlStringNode.ts"/>
///<reference path="ast/SqlJoinsNode.ts"/>
///<reference path="ast/SqlFieldsNode.ts"/>
///<reference path="ast/SqlModifiersNode.ts"/>
///<reference path="ast/SqlSelectNode.ts"/>
///<reference path="ast/SqlFromNode.ts"/>
///<reference path="ast/SqlFieldNode.ts"/>
///<reference path="ast/SqlTableNode.ts"/>
///<reference path="ast/SqlJoinNode.ts"/>
///<reference path="ast/SqlWhereNode.ts"/>
///<reference path="ast/SqlGroupByNode.ts"/>
///<reference path="ast/SqlHavingNode.ts"/>
///<reference path="ast/SqlOrderNode.ts"/>
///<reference path="ast/SqlOrderByNode.ts"/>
///<reference path="ast/SqlLimitNode.ts"/>
///<reference path="ast/SqlParamsNode.ts"/>
///<reference path="ast/SqlExpFuncNode.ts"/>
///<reference path="ast/SqlExpEqNode.ts"/>
///<reference path="ast/SqlExpCaseNode.ts"/>
///<reference path="ast/SqlExpOrNode.ts"/>
///<reference path="ast/SqlExpAndNode.ts"/>
///<reference path="ast/SqlExpAddNode.ts"/>
///<reference path="ast/SqlBetweenAndNode.ts"/>
///<reference path="ast/SqlBetweenNode.ts"/>
///<reference path="ast/SqlIdentityNode.ts"/>
///<reference path="ast/SqlExpUnaryNode.ts"/>
///<reference path="ast/SqlExpMulNode.ts"/>
///<reference path="ast/SqlStarNode.ts"/>
///<reference path="ast/SqlExpHoldNode.ts"/>
///<reference path="ast/SqlExpRefNode.ts"/>
///<reference path="ast/SqlExpRelNode.ts"/>
///<reference path="ast/SqlInsertNode.ts"/>
///<reference path="ast/SqlDeleteNode.ts"/>
///<reference path="ast/SqlUpdateNode.ts"/>
///<reference path="ast/SqlCreateTableNode.ts"/>
///<reference path="ast/SqlFieldDeclareNode.ts"/>
/*
 * select       -> 'select' ['distinct'] fields [from] [where] [groupby] [having] [orderby] [limit]
 * fields       -> field [',' field]*
 * insert       -> 'insert' 'into' identity 'values' '(' identity [',' identity] * ')' 'values' '(' params ')'
 * update       -> 'update' identity 'set' identity '=' exp_or [',' identity '=' exp_or]* [ where ]
 * delete       -> 'delete' 'from' identity [ where ]
 * create_table -> 'create' 'table' identity '(' field_declare [',' field_declare] ')'
 * field_declare-> identity ('varchar' | 'number')
 * from         -> 'from' table
 * field        -> exp_or [['as'] identity]
 * table        -> identity ['as' identity]
 * join         -> ['left'] 'join' table 'on' exp_or
 * where        -> 'where' exp_or
 * groupby      -> 'group' 'by' exp_or [',' exp_or]*
 * having       -> 'having ' [exp_or]
 * orderby      -> 'order' 'by' order [',' order]*
 * order        -> exp_or ['asc' | 'desc']
 * limit        -> 'limit' exp_or [',' exp_or]
 * params       -> exp_or [',' exp_or]+
 * exp_or       -> exp_or 'or' exp_and | exp_and
 * exp_and      -> exp_and ' and ' exp_eq | exp_eq
 * exp_eq       -> exp_eq ('=' | '<>' | 'in' | 'not' 'in' | 'is' | 'is' 'not' | 'between' | 'like' | 'not' 'like') exp_rel | exp_rel
 * exp_rel      -> exp_add ('<' | '<=' | '>' | '>=') exp_add | exp_add
 * exp_add      -> exp_add ('+' | '-') exp_mult | exp_mult
 * exp_mul      -> exp_mul ('*' | '/' | '%') exp_unary | exp_unary
 * exp_unary    -> ('+' | '-' | 'not') exp_unary | factor
 * exp_ref      -> identity '.' (identity | '*')
 * exp_func     -> identity '(' exp_or [',' exp_or]* | empty)  ')'
 * exp_case     -> 'case' [exp_or] ['when' exp_or 'then' exp_or]+ ['else' exp_or] 'end'
 * exp_hold     -> '?'
 * factor       -> identity | string | number | bool | star | exp_hold | exp_ref | exp_func | exp_case | '(' exp_or ')'
 * identity     -> ('_' | a-z | A-Z)['_' | a-z | A-Z | 0-9]*
 * star         -> '*'
 * string       -> ''' (*)* '''
 * number       -> [0-9]+ ['.' [0-9]+]
 * bool         -> 'true' | 'false'
 * null         -> 'null'
*/
/**
 * SQL语法分析类。
 */
var SqlParser = /** @class */ (function () {
    /**
     * 构造函数。
     * @param sql 要分析的SQL语句。
     */
    function SqlParser(sql) {
        this.parseExpAndNode = function (parent) {
            var beginToken = this.peekAndCheck();
            if (!beginToken) {
                return null;
            }
            var node1 = this.parseExpEqNode(parent);
            if (this.errors.length > 0) {
                return null;
            }
            if (!node1) {
                this.errors.push(new SqlError('词法错误：解析逻辑与表达式失败。', beginToken[2]));
                return null;
            }
            var nodeList = [node1];
            var opToken = this.peek();
            while (opToken && opToken[0] == TK_AND) {
                var node = new SqlExpAndNode(parent, opToken[1], opToken[2]);
                nodeList.push(node);
                var node2Token = this.moveNext();
                if (!node2Token) {
                    this.errors.push(new SqlError('词法错误：符号' + opToken[1] + "后面缺少表达式。", opToken[2]));
                    return null;
                }
                var node2 = this.parseExpEqNode(parent);
                if (this.errors.length > 0) {
                    return null;
                }
                if (!node2) {
                    this.errors.push(new SqlError('词法错误：解析符号' + opToken[1] + "右侧表达式失败。", opToken[2]));
                    return null;
                }
                nodeList.push(node2);
                opToken = this.peek();
            }
            if (nodeList.length % 2 == 0) {
                this.errors.push(new SqlError('词法错误：逻辑与表达式数量错误。' + opToken[1] + "右侧表达式失败。", opToken[2]));
                return null;
            }
            //把列表转换为二叉树
            var rootNode = null;
            for (var i in nodeList) {
                var node = nodeList[i];
                if (!rootNode) {
                    rootNode = node;
                }
                else if (node instanceof SqlExpAndNode) {
                    this.setNodeParent(rootNode, node);
                    rootNode = node;
                }
                else {
                    this.setNodeParent(node, rootNode);
                }
            }
            if (parent && rootNode) {
                this.setNodeParent(rootNode, parent);
            }
            return rootNode;
        };
        this.parseFactorNode = function (parent) {
            var beginToken = this.peekAndCheck();
            if (!beginToken) {
                return null;
            }
            if (beginToken[0] == TK_OPEN_PAREN) {
                var expToken = this.moveNext();
                if (!expToken) {
                    this.errors.push(new SqlError('词法错误：括号后面缺少表达式。', beginToken[2]));
                    return null;
                }
                if (expToken[0] == TK_CLOSE_PAREN) {
                    this.errors.push(new SqlError('词法错误：括号内的表达式为空。', beginToken[2]));
                    return null;
                }
                var expNode = this.parseExpOrNode(parent);
                if (!expNode || this.errors.length > 0) {
                    return null;
                }
                var endToken = this.peek();
                if (!endToken || endToken[0] != TK_CLOSE_PAREN) {
                    this.errors.push(new SqlError('词法错误：表达式缺少结束的括号。', beginToken[2]));
                    return null;
                }
                this.moveNext();
                return expNode;
            }
            var node = this.parseNullNode(parent);
            if (node) {
                return node;
            }
            node = this.parseStringNode(parent);
            if (node) {
                return node;
            }
            node = this.parseNumberNode(parent);
            if (node) {
                return node;
            }
            node = this.parseBoolNode(parent);
            if (node) {
                return node;
            }
            node = this.parseStarNode(parent);
            if (node) {
                return node;
            }
            node = this.parseExpHoldNode(parent);
            if (node) {
                return node;
            }
            node = this.parseExpCaseNode(parent);
            if (node) {
                return node;
            }
            node = this.parseExpRefNode(parent);
            if (node) {
                return node;
            }
            node = this.parseExpFuncNode(parent);
            if (node) {
                return node;
            }
            node = this.parseIdentityNode(parent);
            if (node) {
                return node;
            }
            if (this.errors.length == 0) {
                this.errors.push(new SqlError('词法错误：无法识别的表达式：' + beginToken[1], beginToken[2]));
            }
            return null;
        };
        var lexer = new SqlLexer();
        var tokenList = lexer.scan(sql);
        this.tokens = [];
        for (var i = 0; i < tokenList.length; i++) {
            var token = tokenList[i];
            if (token && token[0] != TK_COMMENT) { //skip comment
                this.tokens.push(token);
            }
        }
        this.pos = 0;
        this.errors = [];
    }
    SqlParser.prototype.parseExpOrNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        var node1 = this.parseExpAndNode(parent);
        if (this.errors.length > 0) {
            return null;
        }
        if (node1 == null) {
            if (this.errors.length == 0) {
                this.errors.push(new SqlError('词法错误：解析逻辑或表达式失败。', beginToken[2]));
            }
            return null;
        }
        var nodeList = [node1];
        var opToken = this.peek();
        while (opToken && opToken[0] == TK_OR) {
            var node = new SqlExpOrNode(parent, opToken[1], opToken[2]);
            nodeList.push(node);
            var node2Token = this.moveNext();
            if (!node2Token) {
                this.errors.push(new SqlError('词法错误：符号' + opToken[1] + "后面缺少表达式。", opToken[2]));
                return null;
            }
            var node2 = this.parseExpAndNode(parent);
            if (this.errors.length > 0) {
                return null;
            }
            if (!node2) {
                if (this.errors.length == 0) {
                    this.errors.push(new SqlError('词法错误：解析符号' + opToken[1] + "右侧表达式失败。", opToken[2]));
                }
                return null;
            }
            nodeList.push(node2);
            opToken = this.peek();
        }
        if (nodeList.length % 2 == 0) {
            this.errors.push(new SqlError('词法错误：逻辑或表达式数量错误。', opToken[2]));
            return null;
        }
        //把列表转换为二叉树
        var rootNode = null;
        for (var i in nodeList) {
            var node = nodeList[i];
            if (!rootNode) {
                rootNode = node;
            }
            else if (node instanceof SqlExpOrNode) {
                this.setNodeParent(rootNode, node);
                rootNode = node;
            }
            else {
                this.setNodeParent(node, rootNode);
            }
        }
        if (parent && rootNode) {
            this.setNodeParent(rootNode, parent);
        }
        return rootNode;
    };
    SqlParser.prototype.parseExpEqNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        var beginIndex = this.pos;
        var node1 = this.parseExpRelNode(parent);
        if (this.errors.length > 0) {
            return null;
        }
        if (node1 == null) {
            if (this.errors.length == 0) {
                this.errors.push(new SqlError('词法错误：解析相等表达式失败。', beginToken[2]));
            }
            return null;
        }
        var nodeList = [node1];
        var opToken = this.peek();
        while (opToken && (opToken[0] == TK_EQ || opToken[0] == TK_NE || opToken[0] == TK_IN || opToken[0] == TK_NOT
            || opToken[0] == TK_IS || opToken[0] == TK_BETWEEN || opToken[0] == TK_LIKE)) {
            var node2Token = this.moveNext();
            if (!node2Token) {
                this.errors.push(new SqlError('词法错误：符号' + opToken[1] + "后面缺少表达式。", opToken[2]));
                return null;
            }
            var opValue = opToken[1];
            if (opToken[0] == TK_NOT) {
                if (!node2Token || !(node2Token[0] == TK_IN || node2Token[0] == TK_LIKE)) {
                    this.pos = beginIndex;
                    return null;
                }
                else {
                    opValue += " " + node2Token[1];
                    node2Token = this.moveNext();
                    if (!node2Token) {
                        this.errors.push(new SqlError('词法错误：符号' + opToken[1] + "后面缺少表达式。", opToken[2]));
                        return null;
                    }
                }
            }
            else if (opToken[0] == TK_IS) {
                if (node2Token && node2Token[0] == TK_NOT) {
                    opValue += " " + node2Token[1];
                    node2Token = this.moveNext();
                }
                if (!node2Token) {
                    this.errors.push(new SqlError('词法错误：符号' + opValue + "后面缺少表达式。", opToken[2]));
                    return null;
                }
                if (node2Token[0] != TK_NULL) {
                    this.errors.push(new SqlError('词法错误：符号' + opValue + "后面只能是null。", opToken[2]));
                    return null;
                }
            }
            var node = null;
            if (opValue == 'between') {
                node = new SqlBetweenNode(parent, opValue, opToken[2]);
            }
            else {
                node = new SqlExpEqNode(parent, opValue, opToken[2]);
            }
            nodeList.push(node);
            var node2 = null;
            if (opValue == 'in' || opValue == 'not in') {
                node2 = this.parseParamsNode(parent);
            }
            else if (opValue == 'between') {
                node2 = new SqlBetweenAndNode(null, "and", opToken[2]);
                var num1Node = this.parseExpRelNode(node2);
                if (this.errors.length > 0) {
                    return null;
                }
                if (num1Node == null) {
                    this.errors.push(new SqlError('词法错误：between表达式不完整。', opToken[2]));
                    return null;
                }
                var andToken = this.peek();
                if (!andToken || andToken[0] != TK_AND) {
                    this.errors.push(new SqlError('词法错误：between表达式不完整。', opToken[2]));
                    return null;
                }
                this.moveNext();
                var num2Node = this.parseExpRelNode(node2);
                if (this.errors.length > 0) {
                    return null;
                }
                if (!num2Node) {
                    this.errors.push(new SqlError('词法错误：between表达式不完整。', andToken[2]));
                    return null;
                }
                if (parent) {
                    this.setNodeParent(node2, parent);
                }
            }
            else {
                node2 = this.parseExpRelNode(parent);
            }
            if (this.errors.length > 0) {
                return null;
            }
            if (!node2) {
                if (this.errors.length == 0) {
                    this.errors.push(new SqlError('词法错误：解析符号' + opToken[1] + "右侧表达式失败。", opToken[2]));
                }
                return null;
            }
            nodeList.push(node2);
            opToken = this.peek();
        }
        if (nodeList.length % 2 == 0) {
            this.errors.push(new SqlError('词法错误：相等表达式数量错误。', opToken[2]));
            return null;
        }
        //把列表转换为二叉树
        var rootNode = null;
        for (var i in nodeList) {
            var node = nodeList[i];
            if (!rootNode) {
                rootNode = node;
            }
            else if (node instanceof SqlExpEqNode || node instanceof SqlBetweenNode) {
                this.setNodeParent(rootNode, node);
                rootNode = node;
            }
            else {
                this.setNodeParent(node, rootNode);
            }
        }
        if (parent && rootNode) {
            this.setNodeParent(rootNode, parent);
        }
        return rootNode;
    };
    SqlParser.prototype.parseExpRelNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        var node1 = this.parseExpAddNode(parent);
        if (this.errors.length > 0) {
            return null;
        }
        if (node1 == null) {
            if (this.errors.length == 0) {
                this.errors.push(new SqlError('词法错误：解析关系表达式失败。', beginToken[2]));
            }
            return null;
        }
        var nodeList = [node1];
        var opToken = this.peek();
        while (opToken && (opToken[0] == TK_GT || opToken[0] == TK_GE || opToken[0] == TK_LT || opToken[0] == TK_LE)) {
            var node = new SqlExpRelNode(parent, opToken[1], opToken[2]);
            nodeList.push(node);
            var node2Token = this.moveNext();
            if (!node2Token) {
                this.errors.push(new SqlError('词法错误：符号' + opToken[1] + "后面缺少表达式。", opToken[2]));
                return null;
            }
            var node2 = this.parseExpAddNode(parent);
            if (this.errors.length > 0) {
                return null;
            }
            if (!node2) {
                if (this.errors.length == 0) {
                    this.errors.push(new SqlError('词法错误：解析符号' + opToken[1] + "右侧表达式失败。", opToken[2]));
                }
                return null;
            }
            nodeList.push(node2);
            opToken = this.peek();
        }
        if (nodeList.length % 2 == 0) {
            this.errors.push(new SqlError('词法错误：关系表达式数量错误.', opToken[2]));
            return null;
        }
        //把列表转换为二叉树
        var rootNode = null;
        for (var i in nodeList) {
            var node = nodeList[i];
            if (!rootNode) {
                rootNode = node;
            }
            else if (node instanceof SqlExpRelNode) {
                this.setNodeParent(rootNode, node);
                rootNode = node;
            }
            else {
                this.setNodeParent(node, rootNode);
            }
        }
        if (parent && rootNode) {
            this.setNodeParent(rootNode, parent);
        }
        return rootNode;
    };
    SqlParser.prototype.parseExpAddNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        var node1 = this.parseExpMulNode(parent);
        if (this.errors.length > 0) {
            return null;
        }
        if (node1 == null) {
            if (this.errors.length == 0) {
                this.errors.push(new SqlError('词法错误：解析加减表达式失败。', beginToken[2]));
            }
            return null;
        }
        var nodeList = [node1];
        var opToken = this.peek();
        while (opToken && (opToken[0] == TK_ADD || opToken[0] == TK_SUB)) {
            var node = new SqlExpAddNode(parent, opToken[1], opToken[2]);
            nodeList.push(node);
            var node2Token = this.moveNext();
            if (node2Token == null) {
                this.errors.push(new SqlError('词法错误：符号' + opToken[1] + "后面缺少表达式。", opToken[2]));
                return null;
            }
            var node2 = this.parseExpMulNode(parent);
            if (this.errors.length > 0) {
                return null;
            }
            if (!node2) {
                if (this.errors.length == 0) {
                    this.errors.push(new SqlError('词法错误：解析符号' + opToken[1] + "右侧表达式失败。", opToken[2]));
                }
                return null;
            }
            nodeList.push(node2);
            opToken = this.peek();
        }
        if (nodeList.length % 2 == 0) {
            this.errors.push(new SqlError('词法错误：加减表达式数量错误。', opToken[2]));
            return null;
        }
        //把列表转换为二叉树
        var rootNode = null;
        for (var i in nodeList) {
            var node = nodeList[i];
            if (!rootNode) {
                rootNode = node;
            }
            else if (node instanceof SqlExpAddNode) {
                this.setNodeParent(rootNode, node);
                rootNode = node;
            }
            else {
                this.setNodeParent(node, rootNode);
            }
        }
        if (parent && rootNode) {
            this.setNodeParent(rootNode, parent);
        }
        return rootNode;
    };
    SqlParser.prototype.parseExpMulNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        var node1 = this.parseExpUnaryNode(parent);
        if (this.errors.length > 0) {
            return null;
        }
        if (!node1) {
            if (this.errors.length <= 0) {
                this.errors.push(new SqlError('词法错误：解析乘除表达式失败。', beginToken[2]));
            }
            return null;
        }
        var nodeList = [node1];
        var opToken = this.peek();
        while (opToken && (opToken[0] == TK_MUL || opToken[0] == TK_DIV || opToken[0] == TK_MOD)) {
            var node = new SqlExpMulNode(parent, opToken[1], opToken[2]);
            nodeList.push(node);
            var node2Token = this.moveNext();
            if (!node2Token) {
                this.errors.push(new SqlError('词法错误：符号' + opToken[1] + "后面缺少表达式。", opToken[2]));
                return null;
            }
            var node2 = this.parseExpUnaryNode(parent);
            if (this.errors.length > 0) {
                return null;
            }
            if (!node2) {
                if (this.errors.length <= 0) {
                    this.errors.push(new SqlError('词法错误：解析符号' + opToken[1] + "右侧表达式失败。", opToken[2]));
                }
                return null;
            }
            nodeList.push(node2);
            opToken = this.peek();
        }
        if (nodeList.length % 2 == 0) {
            this.errors.push(new SqlError('词法错误：乘除表达式数量错误。', opToken[2]));
            return null;
        }
        //把列表转换为二叉树
        var rootNode = null;
        for (var i in nodeList) {
            var node = nodeList[i];
            if (!rootNode) {
                rootNode = node;
            }
            else if (node instanceof SqlExpMulNode) {
                this.setNodeParent(rootNode, node);
                rootNode = node;
            }
            else {
                this.setNodeParent(node, rootNode);
            }
        }
        if (parent && rootNode) {
            this.setNodeParent(rootNode, parent);
        }
        return rootNode;
    };
    SqlParser.prototype.parseExpUnaryNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] == TK_NOT || beginToken[0] == TK_ADD || beginToken[0] == TK_SUB) {
            var expToken = this.moveNext();
            if (!expToken) {
                this.errors.push(new SqlError('词法错误：符号' + beginToken[1] + "后面缺少表达式。", beginToken[2]));
                return null;
            }
            var expNode = this.parseExpUnaryNode(parent);
            if (this.errors.length > 0) {
                return null;
            }
            if (!expNode) {
                if (this.errors.length == 0) {
                    this.errors.push(new SqlError('词法错误：一元表达式解析错误。', beginToken[2]));
                }
                return null;
            }
            //对正数和负数做特殊处理
            if (expNode instanceof SqlNumberNode) {
                if (beginToken[0] == TK_ADD) {
                    if (parent) {
                        this.setNodeParent(expNode, parent);
                    }
                    return expNode;
                }
                else if (beginToken[0] == TK_SUB) {
                    expNode.value = '-' + expNode.value;
                    if (parent) {
                        this.setNodeParent(expNode, parent);
                    }
                    return expNode;
                }
            }
            var node = new SqlExpUnaryNode(parent, beginToken[1], beginToken[2]);
            this.setNodeParent(expNode, node);
            return node;
        }
        return this.parseFactorNode(parent);
    };
    SqlParser.prototype.parseNullNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] == TK_NULL) {
            this.moveNext();
            return new SqlNullNode(parent, beginToken[1], beginToken[2]);
        }
        return null;
    };
    SqlParser.prototype.parseBoolNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] == TK_TRUE || beginToken[0] == TK_FALSE) {
            this.moveNext();
            return new SqlBoolNode(parent, beginToken[1], beginToken[2]);
        }
        return null;
    };
    SqlParser.prototype.parseNumberNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] == TK_INT || beginToken[0] == TK_FLOAT) {
            this.moveNext();
            return new SqlNumberNode(parent, beginToken[1], beginToken[2]);
        }
        return null;
    };
    SqlParser.prototype.parseStringNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] == TK_STRING) {
            this.moveNext();
            return new SqlStringNode(parent, beginToken[1], beginToken[2]);
        }
        return null;
    };
    SqlParser.prototype.parseStarNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] == TK_MUL) {
            this.moveNext();
            return new SqlStarNode(parent, beginToken[1], beginToken[2]);
        }
        return null;
    };
    SqlParser.prototype.parseIdentityNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] == TK_IDENTITY) {
            this.moveNext();
            return new SqlIdentityNode(parent, beginToken[1], beginToken[2]);
        }
        return null;
    };
    SqlParser.prototype.parseExpHoldNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] == TK_HOLD) {
            this.moveNext();
            return new SqlExpHoldNode(parent, beginToken[1], beginToken[2]);
        }
        return null;
    };
    SqlParser.prototype.parseExpRefNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        var beginIndex = this.pos;
        var node1 = this.parseIdentityNode(null);
        if (!node1) {
            this.moveTo(beginIndex);
            return null;
        }
        var dotToken = this.peek();
        if (!dotToken || dotToken[0] != TK_DOT) {
            this.moveTo(beginIndex);
            return null;
        }
        var endToken = this.moveNext();
        if (!endToken) {
            this.errors.push(new SqlError('语法错误：' + beginToken[1] + '后缺少引用项的名称。', beginToken[2]));
            return null;
        }
        if (endToken[0] == TK_MUL || endToken[0] == TK_IDENTITY) {
            this.moveNext();
            return new SqlExpRefNode(parent, beginToken[1] + dotToken[1] + endToken[1], beginToken[2]);
        }
        this.errors.push(new SqlError('语法错误：' + beginToken[1] + '后的引用项无效。', beginToken[2]));
        return null;
    };
    SqlParser.prototype.parseExpCaseNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] != TK_CASE) {
            return;
        }
        var whenToken = this.moveNext();
        if (whenToken == null) {
            this.errors.push(new SqlError('语法错误：case后面缺少when表达式。', beginToken[2]));
            return null;
        }
        var caseExpNode = null;
        if (whenToken[0] != TK_WHEN) {
            caseExpNode = this.parseExpOrNode(null);
            if (this.errors.length > 0) {
                return null;
            }
        }
        var whenExpNodeList = [];
        var thenExpNodeList = [];
        var elseExpNode = null;
        whenToken = this.peek();
        while (whenToken && whenToken[0] == TK_WHEN) {
            var whenExpToken = this.moveNext();
            if (!whenExpToken) {
                this.errors.push(new SqlError('语法错误：when后面缺少条件表达式。', whenToken[2]));
                return null;
            }
            var whenExpNode = this.parseExpOrNode(null);
            if (this.errors.length > 0) {
                return null;
            }
            if (!whenExpNode) {
                this.errors.push(new SqlError('语法错误：when后面的条件表达式无效。', whenToken[2]));
                return null;
            }
            var thenToken = this.peek();
            if (!thenToken || thenToken[0] != TK_THEN) {
                this.errors.push(new SqlError('语法错误：缺少关键字then。', whenToken[2]));
                return null;
            }
            var thenExpToken = this.moveNext();
            if (!thenExpToken) {
                this.errors.push(new SqlError('语法错误：then后面缺少取值表达式。', thenToken[2]));
                return null;
            }
            var thenExpNode = this.parseExpOrNode(null);
            if (this.errors.length > 0) {
                return null;
            }
            if (!thenExpNode) {
                this.errors.push(new SqlError('语法错误：then后面的取值表达式无效。', thenToken[2]));
                return null;
            }
            whenExpNodeList.push(whenExpNode);
            thenExpNodeList.push(thenExpNode);
            var elseToken = this.peek();
            if (elseToken && elseToken[0] == TK_ELSE) {
                var elseExpToken = this.moveNext();
                if (!elseExpToken) {
                    this.errors.push(new SqlError('语法错误：else后面缺少取值表达式。', elseToken[2]));
                    return null;
                }
                elseExpNode = this.parseExpOrNode(null);
                if (this.errors.length > 0) {
                    return null;
                }
                if (!elseExpNode) {
                    this.errors.push(new SqlError('语法错误：then后面的取值表达式无效。', elseToken[2]));
                    return null;
                }
            }
            whenToken = this.peek();
        }
        if (whenExpNodeList.length <= 0) {
            this.errors.push(new SqlError('语法错误：case后面缺少when表达式。', beginToken[2]));
            return null;
        }
        var endToken = this.peek();
        if (!endToken || endToken[0] != TK_END) {
            this.errors.push(new SqlError('语法错误：缺少关键字end。', beginToken[2]));
            return null;
        }
        var node = new SqlExpCaseNode(parent, beginToken[1], beginToken[2]);
        var leftNode = null;
        for (var i = 0; i < whenExpNodeList.length; i++) {
            var whenExpNode = whenExpNodeList[i];
            if (caseExpNode) {
                var eqNode = new SqlExpEqNode(node, "=", whenExpNode[2]);
                if (!leftNode) {
                    leftNode = caseExpNode;
                }
                else {
                    leftNode = caseExpNode.clone();
                }
                this.setNodeParent(leftNode, eqNode);
                this.setNodeParent(whenExpNode, eqNode);
            }
            else {
                this.setNodeParent(whenExpNode, node);
            }
            var thenExpNode = thenExpNodeList[i];
            this.setNodeParent(thenExpNode, node);
        }
        if (elseExpNode != null) {
            this.setNodeParent(elseExpNode, node);
        }
        this.moveNext();
        return node;
    };
    SqlParser.prototype.parseParamsNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] != TK_OPEN_PAREN) {
            return null;
        }
        var beginIndex = this.pos;
        this.moveNext();
        var node = new SqlParamsNode(null, ",", beginToken[2]);
        var itemNode = this.parseExpOrNode(node);
        if (!itemNode) {
            this.pos = beginIndex;
            return null;
        }
        var commaToken = this.peek();
        while (commaToken && commaToken[0] == TK_COMMA) {
            var itemToken = this.moveNext();
            if (!itemToken) {
                this.errors.push(new SqlError('语法错误：逗号后面缺少表达式。', commaToken[2]));
                return null;
            }
            itemNode = this.parseExpOrNode(node);
            if (!itemNode) {
                return null;
            }
            commaToken = this.peek();
        }
        var endToken = this.peek();
        if (!endToken || endToken[0] != TK_CLOSE_PAREN) {
            this.errors.push(new SqlError('语法错误：缺少结束的括号。', beginToken[2]));
            return null;
        }
        if (parent) {
            this.setNodeParent(node, parent);
        }
        this.moveNext();
        return node;
    };
    SqlParser.prototype.parseExpFuncNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] != TK_IDENTITY) {
            return null;
        }
        var beginIndex = this.pos;
        var leftBracketToken = this.moveNext();
        if (!leftBracketToken || leftBracketToken[0] != TK_OPEN_PAREN) {
            this.pos = beginIndex;
            return null;
        }
        var itemToken = this.moveNext();
        if (!itemToken) {
            this.errors.push(new SqlError('语法错误：函数调用缺少结束的括号。', beginToken[2]));
        }
        var node = new SqlExpFuncNode(parent, beginToken[1], beginToken[2]);
        //parse modifiers, example: count(distinct name)
        if (itemToken[0] == TK_DISTINCT) {
            var modifiersNode = new SqlModifiersNode(node, " ", beginToken[2]);
            new SqlIdentityNode(modifiersNode, itemToken[1], itemToken[2]);
            itemToken = this.moveNext();
        }
        //parse arguments
        var paramsNode = new SqlParamsNode(node, ",", beginToken[2]);
        if (itemToken && itemToken[0] != TK_CLOSE_PAREN) {
            var itemNode = this.parseExpOrNode(paramsNode);
            if (itemNode) {
                var commaToken = this.peek();
                while (commaToken && commaToken[0] == TK_COMMA) {
                    itemToken = this.moveNext();
                    if (!itemToken) {
                        this.errors.push(new SqlError('语法错误：逗号后面缺少表达式。', commaToken[2]));
                        return node;
                    }
                    itemNode = this.parseExpOrNode(paramsNode);
                    if (!itemNode) {
                        return node;
                    }
                    commaToken = this.peek();
                }
            }
        }
        var rightBracketToken = this.peek();
        if (!rightBracketToken || rightBracketToken[0] != TK_CLOSE_PAREN) {
            this.errors.push(new SqlError('语法错误：函数调用缺少结束的括号。', beginToken[2]));
            return null;
        }
        this.moveNext();
        return node;
    };
    SqlParser.prototype.parseLimitNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] != TK_LIMIT) {
            return null;
        }
        var node = new SqlLimitNode(null, "limit", beginToken[2]);
        var num1Token = this.moveNext();
        if (!num1Token) {
            this.errors.push(new SqlError('语法错误：缺少limit数值。', beginToken[2]));
            return null;
        }
        this.parseFactorNode(node);
        var commaToken = this.peek();
        if (commaToken && commaToken[0] == TK_COMMA) {
            var num2Token = this.moveNext();
            if (!num2Token) {
                this.errors.push(new SqlError('语法错误：逗号后缺少数值。', commaToken[2]));
                return null;
            }
            this.parseFactorNode(node);
        }
        if (node.nodes.length > 2) {
            this.errors.push(new SqlError('语法错误：limit参数太多。', beginToken[2]));
            return null;
        }
        if (parent) {
            this.setNodeParent(node, parent);
        }
        return node;
    };
    SqlParser.prototype.parseOrderByNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] != TK_ORDER) {
            return null;
        }
        var byToken = this.moveNext();
        if (!byToken) {
            this.errors.push(new SqlError('词法错误：缺少关键字by。', beginToken[2]));
            return null;
        }
        var node = new SqlOrderByNode(null, "order by", beginToken[2]);
        var expToken = this.moveNext();
        if (!expToken) {
            this.errors.push(new SqlError('语法错误：缺少排序条件。', beginToken[2]));
            return null;
        }
        while (expToken) {
            var orderNode = new SqlOrderNode(node, null, beginToken[2]);
            var expNode = this.parseExpOrNode(orderNode);
            if (!expNode) {
                break;
            }
            var directionToken = this.peek();
            if (directionToken && (directionToken[0] == TK_ASC || directionToken[0] == TK_DESC)) {
                orderNode.value = directionToken[1];
                this.moveNext();
            }
            var commaToken = this.peek();
            if (commaToken && commaToken[0] == TK_COMMA) {
                expToken = this.moveNext();
            }
            else
                break;
        }
        if (this.errors.length > 0) {
            return null;
        }
        if (node.nodes.length == 0) {
            this.errors.push(new SqlError('语法错误：缺少排序条件。', beginToken[2]));
            return null;
        }
        if (parent) {
            this.setNodeParent(node, parent);
        }
        return node;
    };
    SqlParser.prototype.parseHavingNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] != TK_HAVING) {
            return null;
        }
        var expToken = this.moveNext();
        if (!expToken) {
            this.errors.push(new SqlError('语法错误：关键字having后面缺少条件表达式。', beginToken[2]));
            return null;
        }
        var node = new SqlHavingNode(null, "having", beginToken[2]);
        var expNode = this.parseExpOrNode(node);
        if (!expNode) {
            return null;
        }
        if (parent) {
            this.setNodeParent(node, parent);
        }
        return node;
    };
    SqlParser.prototype.parseGroupByNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] != TK_GROUP) {
            return null;
        }
        var byToken = this.moveNext();
        if (!byToken) {
            this.errors.push(new SqlError('语法错误：缺少关键字by。', beginToken[2]));
            return null;
        }
        var node = new SqlGroupByNode(null, "group by", beginToken[2]);
        var expToken = this.moveNext();
        if (!expToken) {
            this.errors.push(new SqlError('语法错误：缺少分组条件。', beginToken[2]));
            return null;
        }
        while (expToken) {
            var expNode = this.parseExpOrNode(node);
            if (!expNode) {
                break;
            }
            var commaToken = this.peek();
            if (commaToken && commaToken[0] == TK_COMMA) {
                expToken = this.moveNext();
            }
            else
                break;
        }
        if (this.errors.length > 0) {
            return null;
        }
        if (node.nodes.length == 0) {
            this.errors.push(new SqlError('语法错误：缺少分组条件。', beginToken[2]));
            return null;
        }
        if (parent != null) {
            this.setNodeParent(node, parent);
        }
        return node;
    };
    SqlParser.prototype.parseWhereNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] != TK_WHERE) {
            return null;
        }
        var expToken = this.moveNext();
        if (!expToken) {
            this.errors.push(new SqlError('语法错误：关键字where后面缺少条件表达式。', beginToken[2]));
            return null;
        }
        var node = new SqlWhereNode(null, "where", beginToken[2]);
        var expNode = this.parseExpOrNode(node);
        if (!expNode) {
            return null;
        }
        if (parent != null) {
            this.setNodeParent(node, parent);
        }
        return node;
    };
    SqlParser.prototype.parseJoinNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] != TK_LEFT && beginToken[0] != TK_JOIN) {
            return null;
        }
        var joinToken = beginToken;
        var joinOp = "";
        if (joinToken[0] == TK_LEFT) {
            joinOp += joinToken[1];
            joinToken = this.moveNext();
        }
        if (!joinToken || joinToken[0] != TK_JOIN) {
            this.errors.push(new SqlError('语法错误：缺少关键字join。', beginToken[2]));
            return null;
        }
        if (!joinOp) {
            joinOp = joinToken[1];
        }
        else {
            joinOp += " " + joinToken[1];
        }
        this.moveNext();
        var tableNode = this.parseTableNode(null);
        if (!tableNode) {
            return null;
        }
        var onToken = this.peek();
        if (!onToken || onToken[0] != TK_ON) {
            this.errors.push(new SqlError('语法错误：缺少关键字on。', joinToken[2]));
            return null;
        }
        this.moveNext();
        var onNode = this.parseExpOrNode(null);
        if (!onNode) {
            return null;
        }
        var node = new SqlJoinNode(parent, joinOp, joinToken[2]);
        this.setNodeParent(tableNode, node);
        this.setNodeParent(onNode, node);
        return node;
    };
    SqlParser.prototype.parseTableNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        var expNode = this.parseIdentityNode(null);
        if (!expNode) {
            if (this.errors.length == 0) {
                this.errors.push(new SqlError('语法错误：表名无效。', beginToken[2]));
            }
            return null;
        }
        var aliasName = null;
        var aliasToken = this.peek();
        if (aliasToken && (aliasToken[0] == TK_AS || aliasToken[0] == TK_IDENTITY)) {
            var aliasNameToken = null;
            if (aliasToken[0] == TK_AS) {
                aliasNameToken = this.moveNext();
            }
            else if (aliasToken[0] == TK_IDENTITY) {
                aliasNameToken = aliasToken;
            }
            if (!aliasNameToken || aliasNameToken[0] != TK_IDENTITY) {
                this.errors.push(new SqlError('语法错误：表缺少别名。', aliasToken[2]));
                return null;
            }
            aliasName = aliasNameToken[1];
            this.moveNext();
        }
        var node = new SqlTableNode(parent, aliasName, beginToken[2]);
        this.setNodeParent(expNode, node);
        return node;
    };
    SqlParser.prototype.parseFieldNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        var expNode = this.parseExpOrNode(null);
        if (!expNode) {
            return null;
        }
        var aliasName = null;
        var aliasToken = this.peek();
        if (aliasToken && (aliasToken[0] == TK_AS || aliasToken[0] == TK_IDENTITY)) {
            var aliasNameToken = null;
            if (aliasToken[0] == TK_AS) {
                aliasNameToken = this.moveNext();
            }
            else if (aliasToken[0] == TK_IDENTITY) {
                aliasNameToken = aliasToken;
            }
            if (!aliasNameToken || aliasNameToken[0] != TK_IDENTITY) {
                this.errors.push(new SqlError('语法错误：字段缺少别名。', aliasToken[2]));
                return null;
            }
            aliasName = aliasNameToken[1];
            this.moveNext();
        }
        var node = new SqlFieldNode(parent, aliasName, beginToken[2]);
        this.setNodeParent(expNode, node);
        return node;
    };
    SqlParser.prototype.parseFromNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] != TK_FROM) {
            return null;
        }
        var node = new SqlFromNode(null, "from", beginToken[2]);
        this.moveNext();
        var tableNode = this.parseTableNode(node);
        if (!tableNode) {
            this.errors.push(new SqlError('语法错误：from后缺少表名。', beginToken[2]));
            return null;
        }
        var commaToken = this.peek();
        if (commaToken && commaToken[0] == TK_COMMA) {
            this.errors.push(new SqlError('语法错误：from后暂不支持多个表名，请改用join或left join。', beginToken[2]));
            return null;
        }
        if (parent != null) {
            this.setNodeParent(node, parent);
        }
        return node;
    };
    SqlParser.prototype.parseSelectNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] == TK_OPEN_PAREN) {
            this.moveNext();
            var selectNode_1 = this.parseSelectNode(parent);
            if (!selectNode_1 || this.errors.length > 0) {
                return null;
            }
            var endToken = this.peek();
            if (!endToken || endToken[0] != TK_CLOSE_PAREN) {
                this.errors.push(new SqlError('语法错误：缺少匹配的右括号。', beginToken[2]));
                return null;
            }
            this.moveNext();
            return selectNode_1;
        }
        if (beginToken[0] != TK_SELECT) {
            return null;
        }
        var selectNode = new SqlSelectNode(null, "select", beginToken[2]);
        //parse modifier nodes
        var modifiersNode = new SqlModifiersNode(null, " ", beginToken[2]);
        var token = this.moveNext();
        if (token && token[0] == TK_DISTINCT) {
            new SqlIdentityNode(modifiersNode, token[1], token[2]);
            token = this.moveNext();
        }
        if (modifiersNode.nodes.length > 0) {
            this.setNodeParent(modifiersNode, selectNode);
        }
        if (this.errors.length > 0) {
            return null;
        }
        //parse field nodes
        var fieldsNode = new SqlFieldsNode(null, "fields", token[2]);
        while (this.peek()) {
            var fieldNode = this.parseFieldNode(fieldsNode);
            if (!fieldNode) {
                break;
            }
            var commaToken = this.peek();
            if (commaToken && commaToken[0] == TK_COMMA) {
                this.moveNext();
            }
            else
                break;
        }
        if (fieldsNode.nodes.length > 0) {
            this.setNodeParent(fieldsNode, selectNode);
        }
        if (this.errors.length > 0) {
            return null;
        }
        //parse from nodes
        var fromNode = this.parseFromNode(null);
        if (fromNode && fromNode.nodes.length > 0) {
            this.setNodeParent(fromNode, selectNode);
        }
        if (this.errors.length > 0) {
            return null;
        }
        //parse join nodes
        var joinsNode = new SqlJoinsNode(null, "joins", token[2]);
        while (this.peek()) {
            var joinNode = this.parseJoinNode(joinsNode);
            if (!joinNode) {
                break;
            }
        }
        if (joinsNode.nodes.length > 0) {
            this.setNodeParent(joinsNode, selectNode);
        }
        if (this.errors.length > 0) {
            return null;
        }
        //parse where node
        var whereNode = this.parseWhereNode(null);
        if (whereNode && whereNode.nodes.length > 0) {
            this.setNodeParent(whereNode, selectNode);
        }
        if (this.errors.length > 0) {
            return null;
        }
        //parse group by node
        var groupByNode = this.parseGroupByNode(null);
        if (groupByNode && groupByNode.nodes.length > 0) {
            this.setNodeParent(groupByNode, selectNode);
        }
        if (this.errors.length > 0) {
            return null;
        }
        //parse having node
        var havingNode = this.parseHavingNode(null);
        if (havingNode && havingNode.nodes.length > 0) {
            this.setNodeParent(havingNode, selectNode);
        }
        if (this.errors.length > 0) {
            return null;
        }
        //parse order by node
        var orderByNode = this.parseOrderByNode(null);
        if (orderByNode && orderByNode.nodes.length > 0) {
            this.setNodeParent(orderByNode, selectNode);
        }
        if (this.errors.length > 0) {
            return null;
        }
        //parse limit node
        var limitNode = this.parseLimitNode(null);
        if (limitNode && limitNode.nodes.length > 0) {
            this.setNodeParent(limitNode, selectNode);
        }
        if (this.errors.length > 0) {
            return null;
        }
        if (parent) {
            this.setNodeParent(selectNode, parent);
        }
        return selectNode;
    };
    SqlParser.prototype.parseInsertNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] != TK_INSERT) {
            return null;
        }
        var token = this.moveNext();
        if (token == null || token[0] != TK_INTO) {
            this.errors.push(new SqlError('语法错误：insert语句缺少关键字into。', beginToken[2]));
            return null;
        }
        token = this.moveNext();
        if (token == null || token[0] != TK_IDENTITY) {
            this.errors.push(new SqlError('语法错误：insert语句缺少表名。', beginToken[2]));
            return null;
        }
        var insertNode = new SqlInsertNode(null, 'insert into', beginToken[2]);
        this.parseIdentityNode(insertNode);
        token = this.peek();
        if (token == null || token[0] != TK_OPEN_PAREN) {
            this.errors.push(new SqlError('语法错误：insert语句表名后缺少左括号。', beginToken[2]));
            return null;
        }
        var fieldsNode = this.parseParamsNode(insertNode);
        if (this.errors.length > 0) {
            return null;
        }
        for (var i in insertNode.nodes[0].nodes) {
            var fieldNode = insertNode.nodes[0].nodes[i];
            if (!(fieldNode instanceof SqlIdentityNode)) {
                this.errors.push(new SqlError('语法错误：insert字段名无效。', fieldNode.line));
            }
        }
        token = this.peek();
        if (token == null || token[0] != TK_VALUES) {
            this.errors.push(new SqlError('语法错误：insert语句缺少关键字values。', beginToken[2]));
            return null;
        }
        token = this.moveNext();
        if (token == null || token[0] != TK_OPEN_PAREN) {
            this.errors.push(new SqlError('语法错误：insert语句values关键字后缺少左括号。', beginToken[2]));
            return null;
        }
        var valuesNode = this.parseParamsNode(insertNode);
        if (this.errors.length > 0) {
            return null;
        }
        if (fieldsNode.nodes.length != valuesNode.nodes.length) {
            this.errors.push(new SqlError('语法错误：insert语句字段列表和值列表数量不一致。', beginToken[2]));
            return null;
        }
        if (parent) {
            this.setNodeParent(insertNode, parent);
        }
        return insertNode;
    };
    SqlParser.prototype.parseUpdateNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] != TK_UPDATE) {
            return null;
        }
        var updateNode = new SqlUpdateNode(null, "update", beginToken[2]);
        var token = this.moveNext();
        var tableNode = this.parseTableNode(updateNode);
        if (this.errors.length > 0) {
            return null;
        }
        if (!tableNode) {
            this.errors.push(new SqlError('语法错误：update语句缺少表名。', beginToken[2]));
            return null;
        }
        token = this.peek();
        if (token == null || token[0] != TK_SET) {
            this.errors.push(new SqlError('语法错误：update语句表名后缺少关键字set。', beginToken[2]));
            return null;
        }
        var fieldsNode = new SqlParamsNode(updateNode, 'set', beginToken[2]);
        token = this.moveNext();
        while (token) {
            var assignNode = this.parseExpEqNode(fieldsNode);
            if (this.errors.length > 0) {
                return null;
            }
            if (!(assignNode instanceof SqlExpEqNode) || assignNode.value != '='
                || !(assignNode.nodes[0] instanceof SqlIdentityNode || assignNode.nodes[0] instanceof SqlExpRefNode)) {
                this.errors.push(new SqlError('语法错误：update语句的赋值表达式无效。', assignNode.line));
            }
            token = this.peek();
            if (token && token[0] == TK_COMMA) {
                token = this.moveNext();
            }
            else
                break;
        }
        var whereNode = this.parseWhereNode(updateNode);
        if (this.errors.length > 0) {
            return null;
        }
        if (parent) {
            this.setNodeParent(updateNode, parent);
        }
        return updateNode;
    };
    SqlParser.prototype.parseDeleteNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] != TK_DELETE) {
            return null;
        }
        var token = this.moveNext();
        if (token == null || token[0] != TK_FROM) {
            this.errors.push(new SqlError('语法错误：delete语句缺少关键字from。', beginToken[2]));
            return null;
        }
        token = this.moveNext();
        var deleteNode = new SqlDeleteNode(null, "delete from", beginToken[2]);
        var tableNode = this.parseTableNode(deleteNode);
        if (this.errors.length > 0) {
            return null;
        }
        if (tableNode == null) {
            this.errors.push(new SqlError('语法错误：delete语句缺少表名。', beginToken[2]));
            return null;
        }
        var whereNode = this.parseWhereNode(deleteNode);
        if (this.errors.length > 0) {
            return null;
        }
        if (parent) {
            this.setNodeParent(deleteNode, parent);
        }
        return deleteNode;
    };
    SqlParser.prototype.parseCreateTableNode = function (parent) {
        var beginToken = this.peekAndCheck();
        if (!beginToken) {
            return null;
        }
        if (beginToken[0] != TK_CREATE) {
            return null;
        }
        var token = this.moveNext();
        if (token == null || token[0] != TK_TABLE) {
            return null;
        }
        token = this.moveNext();
        if (token == null || token[0] != TK_IDENTITY) {
            this.errors.push(new SqlError('语法错误：create table语句缺少表名。', beginToken[2]));
            return null;
        }
        var createNode = new SqlCreateTableNode(null, "create table", beginToken[2]);
        var tableNode = this.parseIdentityNode(createNode);
        token = this.peek();
        if (token == null || token[0] != TK_OPEN_PAREN) {
            this.errors.push(new SqlError('语法错误：create table语句表名后缺少左括号。', beginToken[2]));
            return null;
        }
        token = this.moveNext();
        var fieldsNode = new SqlParamsNode(createNode, ",", beginToken[2]);
        while (token && token[0] != TK_CLOSE_PAREN) {
            if (token[0] != TK_IDENTITY) {
                this.errors.push(new SqlError('语法错误：create table语句字段名无效。', beginToken[2]));
                return null;
            }
            var fieldNode = new SqlFieldDeclareNode(fieldsNode, token[1], token[2]);
            token = this.moveNext();
            var typeNode = this.parseIdentityNode(fieldNode);
            if (this.errors.length > 0) {
                return null;
            }
            if (!typeNode) {
                this.errors.push(new SqlError('语法错误：create table语句字段声明缺少类型。', beginToken[2]));
                return null;
            }
            if (typeNode.value != 'varchar' && typeNode.value != 'number') {
                this.errors.push(new SqlError('语法错误：create table语句字段声明类型无效，目前只支持：varchar、number。', beginToken[2]));
                return null;
            }
            token = this.peek();
            //忽略类型的长度和精度
            if (token && token[0] == TK_OPEN_PAREN) {
                while (token && token[0] != TK_CLOSE_PAREN) {
                    token = this.moveNext();
                }
                if (!token || token[0] != TK_CLOSE_PAREN) {
                    this.errors.push(new SqlError('语法错误：create table语句的类型声明缺少结束的括号。', beginToken[2]));
                    return null;
                }
                token = this.moveNext();
            }
            if (token && token[0] == TK_COMMA) {
                token = this.moveNext();
            }
        }
        if (!token || token[0] != TK_CLOSE_PAREN) {
            this.errors.push(new SqlError('语法错误：create table语句缺少结束的右括号。', beginToken[2]));
            return null;
        }
        if (fieldsNode.nodes.length == 0) {
            this.errors.push(new SqlError('语法错误：create table语句缺少字段定义。', beginToken[2]));
            return null;
        }
        if (parent) {
            this.setNodeParent(createNode, parent);
        }
        this.moveNext();
        return createNode;
    };
    /**
     * 获取指定位置的单词。
     * @param i 位置索引号（从0开始）。
     */
    SqlParser.prototype.peekAt = function (i) {
        return i >= 0 && i < this.tokens.length ? this.tokens[i] : null;
    };
    /**
     * 保持游标不动，获取当前位置的单词。
     */
    SqlParser.prototype.peek = function () {
        return this.peekAt(this.pos);
    };
    /**
     * 读取当前单词，并检查词法错误。
     */
    SqlParser.prototype.peekAndCheck = function () {
        var token = this.peek();
        if (!token || this.errors.length > 0) {
            return null;
        }
        if (token[0] == TK_ERROR) {
            this.errors.push(new SqlError('词法错误：' + token[1], token[2]));
            return null;
        }
        return token;
    };
    /**
     * 保持游标不动，获取下一个位置的单词。
     */
    SqlParser.prototype.peekNext = function () {
        return this.peekAt(this.pos + 1);
    };
    /**
     * 保持游标不动，获取上一个位置的单词。
     */
    SqlParser.prototype.peekPrev = function () {
        return this.peekAt(this.pos - 1);
    };
    /**
     * 移动游标到下一个位置，并返回相应的单词。
     */
    SqlParser.prototype.moveNext = function () {
        return this.moveTo(this.pos + 1);
    };
    /**
     * 移动游标到指定位置，并返回相应的单词。
     */
    SqlParser.prototype.moveTo = function (i) {
        this.pos = i;
        return this.peekAt(this.pos);
    };
    /**
     * 修改指定节点所属的父节点。
     * @param node
     * @param parent
     */
    SqlParser.prototype.setNodeParent = function (node, parent) {
        if (node && node.parent != parent) {
            if (node.parent) {
                var i = node.parent.nodes.indexOf(node);
                if (i >= 0) {
                    node.parent.nodes.splice(i, 1);
                }
            }
            if (parent) {
                node.parent = parent;
                var i = parent.nodes.indexOf(node);
                if (i < 0) {
                    parent.nodes.push(node);
                }
            }
        }
    };
    return SqlParser;
}());
