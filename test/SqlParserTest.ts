///<reference path="Assert.ts"/>
///<reference path="../src/SqlLexer.ts"/>
///<reference path="../src/SqlParser.ts"/>


console.log('----- unit tests for parser -----');

Assert.runCase('parse null', function () {
    let parser = new SqlParser('null');
    let node = parser.parseNullNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, 'null');
    Assert.isEqual(node.toSql(), 'null');

    parser = new SqlParser('NULL');
    node = parser.parseNullNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, 'null');
    Assert.isEqual(node.toSql(), 'null');
});

Assert.runCase('parse bool', function () {
    let parser = new SqlParser('true');
    let node = parser.parseBoolNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, 'true');
    Assert.isEqual(node.toSql(), 'true');

    parser = new SqlParser('True');
    node = parser.parseBoolNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, 'true');
    Assert.isEqual(node.toSql(), 'true');

    parser = new SqlParser('false');
    node = parser.parseBoolNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, 'false');
    Assert.isEqual(node.toSql(), 'false');

    parser = new SqlParser('False');
    node = parser.parseBoolNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, 'false');
    Assert.isEqual(node.toSql(), 'false');
});

Assert.runCase('parse number', function () {
    let parser = new SqlParser('123');
    let node = parser.parseNumberNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, '123');
    Assert.isEqual(node.toSql(), '123');

    parser = new SqlParser('123.456');
    node = parser.parseNumberNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, '123.456');
    Assert.isEqual(node.toSql(), '123.456');
});

Assert.runCase('parse string', function () {
    let parser = new SqlParser("'123'");
    let node = parser.parseStringNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "'123'");
    Assert.isEqual(node.toSql(), "'123'");

    parser = new SqlParser("'hello'");
    node = parser.parseStringNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "'hello'");
    Assert.isEqual(node.toSql(), "'hello'");

    parser = new SqlParser("'hello\\'world'");
    node = parser.parseStringNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "'hello\\'world'");
    Assert.isEqual(node.toSql(), "'hello\\'world'");
});

Assert.runCase('parse star', function () {
    let parser = new SqlParser("*");
    let node = parser.parseStarNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "*");
    Assert.isEqual(node.toSql(), "*");
});

Assert.runCase('parse identity', function () {
    let parser = new SqlParser("name");
    let node = parser.parseIdentityNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "name");
    Assert.isEqual(node.toSql(), "name");

    parser = new SqlParser("_name");
    node = parser.parseIdentityNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "_name");
    Assert.isEqual(node.toSql(), "_name");

    parser = new SqlParser("_name_");
    node = parser.parseIdentityNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "_name_");
    Assert.isEqual(node.toSql(), "_name_");

    parser = new SqlParser("name123");
    node = parser.parseIdentityNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "name123");
    Assert.isEqual(node.toSql(), "name123");
});

Assert.runCase('parse exp hold', function () {
    let parser = new SqlParser("?");
    let node = parser.parseExpHoldNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "?");
    Assert.isEqual(node.toSql(), "?");
});

Assert.runCase('parse exp ref', function () {
    let parser = new SqlParser("t.id");
    let node = parser.parseExpRefNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "t.id");
    Assert.isEqual(node.toSql(), "t.id");

    parser = new SqlParser("t.*");
    node = parser.parseExpRefNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "t.*");
    Assert.isEqual(node.toSql(), "t.*");
});

Assert.runCase('parse exp func', function () {
    let parser = new SqlParser("date ()");
    let node = parser.parseExpFuncNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "date");
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlParamsNode);
    Assert.isEqual(node.nodes[0].nodes.length, 0);
    Assert.isEqual(node.toSql(), "date()");

    parser = new SqlParser("date('today')");
    node = parser.parseExpFuncNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "date");
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlParamsNode);
    Assert.isEqual(node.nodes[0].nodes.length, 1);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlStringNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, "'today'");
    Assert.isEqual(node.toSql(), "date('today')");

    parser = new SqlParser("count(distinct cust_no)");
    node = parser.parseExpFuncNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "count");
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlModifiersNode);
    Assert.isTrue(node.nodes[1] instanceof SqlParamsNode);
    Assert.isEqual(node.nodes[0].nodes.length, 1);
    Assert.isEqual(node.nodes[1].nodes.length, 1);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[1].nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, "distinct");
    Assert.isEqual(node.nodes[1].nodes[0].value, "cust_no");
    Assert.isEqual(node.toSql(), "count(distinct cust_no)");
});

Assert.runCase('parse exp case', function () {
    let parser = new SqlParser("case status when 1 then 'A' end");
    let node = parser.parseExpCaseNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "case");
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlExpEqNode);
    Assert.isTrue(node.nodes[1] instanceof SqlStringNode);
    Assert.isEqual(node.nodes[0].nodes.length, 2);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[0].nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, 'status');
    Assert.isEqual(node.nodes[0].nodes[1].value, '1');
    Assert.isEqual(node.nodes[1].value, "'A'")
    Assert.isEqual(node.toSql(), "case when status = 1 then 'A' end");

    parser = new SqlParser("case status when 1 then 'A' when 2 then 'B' else 'C' end");
    node = parser.parseExpCaseNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "case");
    Assert.isEqual(node.nodes.length, 5);
    Assert.isTrue(node.nodes[0] instanceof SqlExpEqNode);
    Assert.isTrue(node.nodes[1] instanceof SqlStringNode);
    Assert.isTrue(node.nodes[2] instanceof SqlExpEqNode);
    Assert.isTrue(node.nodes[3] instanceof SqlStringNode);
    Assert.isTrue(node.nodes[4] instanceof SqlStringNode);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[0].nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, 'status');
    Assert.isEqual(node.nodes[0].nodes[1].value, '1');
    Assert.isEqual(node.nodes[1].value, "'A'")
    Assert.isTrue(node.nodes[2].nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[2].nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[2].nodes[0].value, 'status');
    Assert.isEqual(node.nodes[2].nodes[1].value, '2');
    Assert.isEqual(node.nodes[3].value, "'B'");
    Assert.isEqual(node.nodes[4].value, "'C'");
    Assert.isEqual(node.toSql(), "case when status = 1 then 'A' when status = 2 then 'B' else 'C' end");

    parser = new SqlParser("case when status=1 then 'A' when status=2 then 'B' else 'C' end");
    node = parser.parseExpCaseNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "case");
    Assert.isEqual(node.nodes.length, 5);
    Assert.isTrue(node.nodes[0] instanceof SqlExpEqNode);
    Assert.isTrue(node.nodes[1] instanceof SqlStringNode);
    Assert.isTrue(node.nodes[2] instanceof SqlExpEqNode);
    Assert.isTrue(node.nodes[3] instanceof SqlStringNode);
    Assert.isTrue(node.nodes[4] instanceof SqlStringNode);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[0].nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, 'status');
    Assert.isEqual(node.nodes[0].nodes[1].value, '1');
    Assert.isEqual(node.nodes[1].value, "'A'")
    Assert.isTrue(node.nodes[2].nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[2].nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[2].nodes[0].value, 'status');
    Assert.isEqual(node.nodes[2].nodes[1].value, '2');
    Assert.isEqual(node.nodes[3].value, "'B'");
    Assert.isEqual(node.nodes[4].value, "'C'");
    Assert.isEqual(node.toSql(), "case when status = 1 then 'A' when status = 2 then 'B' else 'C' end");
});

Assert.runCase('parse factor', function () {
    let parser = new SqlParser("id");
    let node = parser.parseFactorNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlIdentityNode);
    Assert.isEqual(node.value, "id");
    Assert.isEqual(node.toSql(), "id");

    parser = new SqlParser("(id)");
    node = parser.parseFactorNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlIdentityNode);
    Assert.isEqual(node.value, "id");
    Assert.isEqual(node.toSql(), "id");

    parser = new SqlParser("t.id");
    node = parser.parseFactorNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpRefNode);
    Assert.isEqual(node.value, "t.id");
    Assert.isEqual(node.toSql(), "t.id");

    parser = new SqlParser("((t.id))");
    node = parser.parseFactorNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpRefNode);
    Assert.isEqual(node.value, "t.id");
    Assert.isEqual(node.toSql(), "t.id");

    parser = new SqlParser("True");
    node = parser.parseFactorNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlBoolNode);
    Assert.isEqual(node.value, "true");
    Assert.isEqual(node.toSql(), "true");

    parser = new SqlParser("false");
    node = parser.parseFactorNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlBoolNode);
    Assert.isEqual(node.value, "false");
    Assert.isEqual(node.toSql(), "false");

    parser = new SqlParser("123");
    node = parser.parseFactorNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlNumberNode);
    Assert.isEqual(node.value, "123");
    Assert.isEqual(node.toSql(), "123");

    parser = new SqlParser("123.456");
    node = parser.parseFactorNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlNumberNode);
    Assert.isEqual(node.value, "123.456");
    Assert.isEqual(node.toSql(), "123.456");

    parser = new SqlParser("'hello'");
    node = parser.parseFactorNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlStringNode);
    Assert.isEqual(node.value, "'hello'");
    Assert.isEqual(node.toSql(), "'hello'");

    parser = new SqlParser(" ? ");
    node = parser.parseFactorNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpHoldNode);
    Assert.isEqual(node.value, "?");
    Assert.isEqual(node.toSql(), "?");

    parser = new SqlParser(" * ");
    node = parser.parseFactorNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlStarNode);
    Assert.isEqual(node.value, "*");
    Assert.isEqual(node.toSql(), "*");

    parser = new SqlParser("date()");
    node = parser.parseFactorNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "date");
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlParamsNode);
    Assert.isEqual(node.nodes[0].nodes.length, 0);
    Assert.isEqual(node.toSql(), "date()");

    parser = new SqlParser("count(distinct cust_no)");
    node = parser.parseFactorNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "count");
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlModifiersNode);
    Assert.isTrue(node.nodes[1] instanceof SqlParamsNode);
    Assert.isEqual(node.nodes[0].nodes.length, 1);
    Assert.isEqual(node.nodes[1].nodes.length, 1);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[1].nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, "distinct");
    Assert.isEqual(node.nodes[1].nodes[0].value, "cust_no");
    Assert.isEqual(node.toSql(), "count(distinct cust_no)");

    parser = new SqlParser("(count(distinct cust_no))");
    node = parser.parseFactorNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "count");
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlModifiersNode);
    Assert.isTrue(node.nodes[1] instanceof SqlParamsNode);
    Assert.isEqual(node.nodes[0].nodes.length, 1);
    Assert.isEqual(node.nodes[1].nodes.length, 1);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[1].nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, "distinct");
    Assert.isEqual(node.nodes[1].nodes[0].value, "cust_no");
    Assert.isEqual(node.toSql(), "count(distinct cust_no)");

    parser = new SqlParser("(case when status=1 then 'A' when status=2 then 'B' else 'C' end)");
    node = parser.parseFactorNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node != null);
    Assert.isEqual(node.value, "case");
    Assert.isEqual(node.nodes.length, 5);
    Assert.isTrue(node.nodes[0] instanceof SqlExpEqNode);
    Assert.isTrue(node.nodes[1] instanceof SqlStringNode);
    Assert.isTrue(node.nodes[2] instanceof SqlExpEqNode);
    Assert.isTrue(node.nodes[3] instanceof SqlStringNode);
    Assert.isTrue(node.nodes[4] instanceof SqlStringNode);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[0].nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, 'status');
    Assert.isEqual(node.nodes[0].nodes[1].value, '1');
    Assert.isEqual(node.nodes[1].value, "'A'")
    Assert.isTrue(node.nodes[2].nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[2].nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[2].nodes[0].value, 'status');
    Assert.isEqual(node.nodes[2].nodes[1].value, '2');
    Assert.isEqual(node.nodes[3].value, "'B'");
    Assert.isEqual(node.nodes[4].value, "'C'");
    Assert.isEqual(node.toSql(), "case when status = 1 then 'A' when status = 2 then 'B' else 'C' end");
});

Assert.runCase('parse exp add', function () {
    let parser = new SqlParser("id + 1");
    let node = parser.parseExpAddNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpAddNode);
    Assert.isEqual(node.value, '+');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'id');
    Assert.isTrue(node.nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[1].value, '1');
    Assert.isEqual(node.toSql(), "id + 1");

    parser = new SqlParser("id-1");
    node = parser.parseExpAddNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpAddNode);
    Assert.isEqual(node.value, '-');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'id');
    Assert.isTrue(node.nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[1].value, '1');
    Assert.isEqual(node.toSql(), "id - 1");
});

Assert.runCase('parse exp mul', function () {
    let parser = new SqlParser("id * 1");
    let node = parser.parseExpMulNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpMulNode);
    Assert.isEqual(node.value, '*');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'id');
    Assert.isTrue(node.nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[1].value, '1');
    Assert.isEqual(node.toSql(), "id * 1");

    parser = new SqlParser("id / 1");
    node = parser.parseExpMulNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpMulNode);
    Assert.isEqual(node.value, '/');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'id');
    Assert.isTrue(node.nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[1].value, '1');
    Assert.isEqual(node.toSql(), "id / 1");

    parser = new SqlParser("id % 1");
    node = parser.parseExpMulNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpMulNode);
    Assert.isEqual(node.value, '%');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'id');
    Assert.isTrue(node.nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[1].value, '1');
    Assert.isEqual(node.toSql(), "id % 1");
});

Assert.runCase('parse exp eq', function () {
    let parser = new SqlParser("id = 1");
    let node = parser.parseExpEqNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpEqNode);
    Assert.isEqual(node.value, '=');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'id');
    Assert.isTrue(node.nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[1].value, '1');
    Assert.isEqual(node.toSql(), "id = 1");

    parser = new SqlParser("id <> 1");
    node = parser.parseExpEqNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpEqNode);
    Assert.isEqual(node.value, '<>');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'id');
    Assert.isTrue(node.nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[1].value, '1');
    Assert.isEqual(node.toSql(), "id <> 1");

    parser = new SqlParser("a between 100 and 200");
    node = parser.parseExpEqNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlBetweenNode);
    Assert.isEqual(node.value, 'between');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'a');
    Assert.isTrue(node.nodes[1] instanceof SqlBetweenAndNode);
    Assert.isEqual(node.nodes[1].value, 'and');
    Assert.isEqual(node.nodes[1].nodes.length, 2);
    Assert.isEqual(node.nodes[1].nodes[0].value, '100');
    Assert.isEqual(node.nodes[1].nodes[1].value, '200');
    Assert.isEqual(node.toSql(), "a between 100 and 200");
});

Assert.runCase('parse exp rel', function () {
    let parser = new SqlParser("id > 1");
    let node = parser.parseExpRelNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpRelNode);
    Assert.isEqual(node.value, '>');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'id');
    Assert.isTrue(node.nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[1].value, '1');
    Assert.isEqual(node.toSql(), "id > 1");

    parser = new SqlParser("id >= 1");
    node = parser.parseExpRelNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpRelNode);
    Assert.isEqual(node.value, '>=');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'id');
    Assert.isTrue(node.nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[1].value, '1');
    Assert.isEqual(node.toSql(), "id >= 1");

    parser = new SqlParser("id < 1");
    node = parser.parseExpRelNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpRelNode);
    Assert.isEqual(node.value, '<');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'id');
    Assert.isTrue(node.nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[1].value, '1');
    Assert.isEqual(node.toSql(), "id < 1");

    parser = new SqlParser("id <= 1");
    node = parser.parseExpRelNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpRelNode);
    Assert.isEqual(node.value, '<=');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'id');
    Assert.isTrue(node.nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[1].value, '1');
    Assert.isEqual(node.toSql(), "id <= 1");
});

Assert.runCase('parse exp and', function () {
    let parser = new SqlParser("a and b");
    let node = parser.parseExpAndNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpAndNode);
    Assert.isEqual(node.value, 'and');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'a');
    Assert.isTrue(node.nodes[1] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[1].value, 'b');
    Assert.isEqual(node.toSql(), "a and b");

    parser = new SqlParser("a > 1 and b < 2");
    node = parser.parseExpAndNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpAndNode);
    Assert.isEqual(node.value, 'and');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlExpRelNode);
    Assert.isEqual(node.nodes[0].value, '>');
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, 'a');
    Assert.isTrue(node.nodes[0].nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[0].nodes[1].value, '1');
    Assert.isTrue(node.nodes[1] instanceof SqlExpRelNode);
    Assert.isEqual(node.nodes[1].value, '<');
    Assert.isTrue(node.nodes[1].nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[1].nodes[0].value, 'b');
    Assert.isTrue(node.nodes[1].nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[1].nodes[1].value, '2');
    Assert.isEqual(node.toSql(), "a > 1 and b < 2");
});

Assert.runCase('parse exp or', function () {
    let parser = new SqlParser("a or b");
    let node = parser.parseExpOrNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpOrNode);
    Assert.isEqual(node.value, 'or');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'a');
    Assert.isTrue(node.nodes[1] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[1].value, 'b');
    Assert.isEqual(node.toSql(), "a or b");

    parser = new SqlParser("a > 1 or b < 2");
    node = parser.parseExpOrNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpOrNode);
    Assert.isEqual(node.value, 'or');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlExpRelNode);
    Assert.isEqual(node.nodes[0].value, '>');
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[0].nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, 'a');
    Assert.isEqual(node.nodes[0].nodes[1].value, '1');
    Assert.isTrue(node.nodes[1] instanceof SqlExpRelNode);
    Assert.isEqual(node.nodes[1].value, '<');
    Assert.isTrue(node.nodes[1].nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[1].nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[1].nodes[0].value, 'b');
    Assert.isEqual(node.nodes[1].nodes[1].value, '2');
    Assert.isEqual(node.toSql(), "a > 1 or b < 2");

    parser = new SqlParser("a or b and c");
    node = parser.parseExpOrNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpOrNode);
    Assert.isEqual(node.value, 'or');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[1] instanceof SqlExpAndNode);
    Assert.isEqual(node.nodes[0].value, 'a');
    Assert.isEqual(node.nodes[1].value, 'and');
    Assert.isEqual(node.nodes[1].nodes.length, 2);
    Assert.isTrue(node.nodes[1].nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[1].nodes[0].value, 'b');
    Assert.isTrue(node.nodes[1].nodes[1] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[1].nodes[1].value, 'c');
    Assert.isEqual(node.toSql(), "a or (b and c)");

    parser = new SqlParser("(a or b) and c");
    node = parser.parseExpOrNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpAndNode);
    Assert.isEqual(node.value, 'and');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlExpOrNode);
    Assert.isTrue(node.nodes[1] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'or');
    Assert.isEqual(node.nodes[0].nodes.length, 2);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, 'a');
    Assert.isTrue(node.nodes[0].nodes[1] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].nodes[1].value, 'b');
    Assert.isEqual(node.nodes[1].value, 'c');
    Assert.isEqual(node.toSql(), "(a or b) and c");

    parser = new SqlParser("a and b or c");
    node = parser.parseExpOrNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpOrNode);
    Assert.isEqual(node.value, 'or');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlExpAndNode);
    Assert.isTrue(node.nodes[1] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].nodes.length, 2);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, 'a');
    Assert.isTrue(node.nodes[0].nodes[1] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].nodes[1].value, 'b');
    Assert.isEqual(node.nodes[1].value, 'c');
    Assert.isEqual(node.toSql(), "(a and b) or c");

    parser = new SqlParser("a and (b or c)");
    node = parser.parseExpOrNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpAndNode);
    Assert.isEqual(node.value, 'and');
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[1] instanceof SqlExpOrNode);
    Assert.isEqual(node.nodes[0].value, 'a');
    Assert.isEqual(node.nodes[1].value, 'or');
    Assert.isEqual(node.nodes[1].nodes.length, 2);
    Assert.isTrue(node.nodes[1].nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[1].nodes[0].value, 'b');
    Assert.isTrue(node.nodes[1].nodes[1] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[1].nodes[1].value, 'c');
    Assert.isEqual(node.toSql(), "a and (b or c)");
});

Assert.runCase('parse exp unary', function () {
    let parser = new SqlParser("not a");
    let node = parser.parseExpUnaryNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpUnaryNode);
    Assert.isEqual(node.value, "not");
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'a');
    Assert.isEqual(node.toSql(), "not a");

    parser = new SqlParser("not (a)");
    node = parser.parseExpUnaryNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpUnaryNode);
    Assert.isEqual(node.value, "not");
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'a');
    Assert.isEqual(node.toSql(), "not a");

    parser = new SqlParser("+a");
    node = parser.parseExpUnaryNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpUnaryNode);
    Assert.isEqual(node.value, "+");
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'a');
    Assert.isEqual(node.toSql(), "+a");

    parser = new SqlParser("- a");
    node = parser.parseExpUnaryNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlExpUnaryNode);
    Assert.isEqual(node.value, "-");
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'a');
    Assert.isEqual(node.toSql(), "-a");

    parser = new SqlParser("+123");
    node = parser.parseExpUnaryNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlNumberNode);
    Assert.isEqual(node.value, "123");
    Assert.isEqual(node.toSql(), "123");

    parser = new SqlParser("- 123");
    node = parser.parseExpUnaryNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlNumberNode);
    Assert.isEqual(node.value, "-123");
    Assert.isEqual(node.toSql(), "-123");
});

Assert.runCase('parse params', function () {
    let parser = new SqlParser("(1, '2', true, id)");
    let node = parser.parseParamsNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlParamsNode);
    Assert.isEqual(node.value, ",");
    Assert.isEqual(node.nodes.length, 4);
    Assert.isTrue(node.nodes[0] instanceof SqlNumberNode);
    Assert.isTrue(node.nodes[1] instanceof SqlStringNode);
    Assert.isTrue(node.nodes[2] instanceof SqlBoolNode);
    Assert.isTrue(node.nodes[3] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, '1');
    Assert.isEqual(node.nodes[1].value, "'2'");
    Assert.isEqual(node.nodes[2].value, 'true');
    Assert.isEqual(node.nodes[3].value, 'id');
    Assert.isEqual(node.toSql(), "(1, '2', true, id)");
});

Assert.runCase('parse field', function () {
    let parser = new SqlParser("id");
    let node = parser.parseFieldNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlFieldNode);
    Assert.isEqual(node.value, null);
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'id');
    Assert.isEqual(node.toSql(), "id");

    parser = new SqlParser("id c");
    node = parser.parseFieldNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlFieldNode);
    Assert.isEqual(node.value, 'c');
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'id');
    Assert.isEqual(node.toSql(), "id as c");

    parser = new SqlParser("id as c");
    node = parser.parseFieldNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlFieldNode);
    Assert.isEqual(node.value, 'c');
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'id');
    Assert.isEqual(node.toSql(), "id as c");

    parser = new SqlParser("1+2");
    node = parser.parseFieldNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlFieldNode);
    Assert.isEqual(node.value, null);
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlExpAddNode);
    Assert.isEqual(node.nodes[0].nodes.length, 2);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlNumberNode);
    Assert.isTrue(node.nodes[0].nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, '1');
    Assert.isEqual(node.nodes[0].nodes[1].value, '2');
    Assert.isEqual(node.toSql(), "1 + 2");

    parser = new SqlParser("1+2 as id");
    node = parser.parseFieldNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlFieldNode);
    Assert.isEqual(node.value, 'id');
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlExpAddNode);
    Assert.isEqual(node.nodes[0].nodes.length, 2);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlNumberNode);
    Assert.isTrue(node.nodes[0].nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, '1');
    Assert.isEqual(node.nodes[0].nodes[1].value, '2');
    Assert.isEqual(node.toSql(), "1 + 2 as id");

    parser = new SqlParser("(1 + 2) as id");
    node = parser.parseFieldNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlFieldNode);
    Assert.isEqual(node.value, 'id');
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlExpAddNode);
    Assert.isEqual(node.nodes[0].nodes.length, 2);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlNumberNode);
    Assert.isTrue(node.nodes[0].nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, '1');
    Assert.isEqual(node.nodes[0].nodes[1].value, '2');
    Assert.isEqual(node.toSql(), "1 + 2 as id");
});

Assert.runCase('parse table', function () {
    let parser = new SqlParser("company");
    let node = parser.parseTableNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlTableNode);
    Assert.isEqual(node.value, null);
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'company');
    Assert.isEqual(node.toSql(), "company");

    parser = new SqlParser("company c");
    node = parser.parseTableNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlTableNode);
    Assert.isEqual(node.value, 'c');
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'company');
    Assert.isEqual(node.toSql(), "company c");

    parser = new SqlParser("company as c");
    node = parser.parseTableNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlTableNode);
    Assert.isEqual(node.value, 'c');
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'company');
    Assert.isEqual(node.toSql(), "company c");
});

Assert.runCase('parse where', function () {
    let parser = new SqlParser("where id = 1");
    let node = parser.parseWhereNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlWhereNode);
    Assert.isEqual(node.value, "where");
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlExpEqNode);
    Assert.isEqual(node.nodes[0].value, '=');
    Assert.isEqual(node.nodes[0].nodes.length, 2);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[0].nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, 'id');
    Assert.isEqual(node.nodes[0].nodes[1].value, '1');
    Assert.isEqual(node.toSql(), "where id = 1");

    parser = new SqlParser("where a > 1 or b < 2");
    node = parser.parseWhereNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlWhereNode);
    Assert.isEqual(node.value, "where");
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlExpOrNode);
    Assert.isEqual(node.nodes[0].value, 'or');
    Assert.isEqual(node.nodes[0].nodes.length, 2);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlExpRelNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, '>');
    Assert.isTrue(node.nodes[0].nodes[0].nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[0].nodes[0].nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[0].nodes[0].nodes[0].value, 'a');
    Assert.isEqual(node.nodes[0].nodes[0].nodes[1].value, '1');
    Assert.isTrue(node.nodes[0].nodes[1] instanceof SqlExpRelNode);
    Assert.isEqual(node.nodes[0].nodes[1].value, '<');
    Assert.isTrue(node.nodes[0].nodes[1].nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[0].nodes[1].nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[0].nodes[1].nodes[0].value, 'b');
    Assert.isEqual(node.nodes[0].nodes[1].nodes[1].value, '2');
    Assert.isEqual(node.toSql(), "where a > 1 or b < 2");
});

Assert.runCase('parse limit', function () {
    let parser = new SqlParser("limit 10");
    let node = parser.parseLimitNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlLimitNode);
    Assert.isEqual(node.value, "limit");
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[0].value, '10');
    Assert.isEqual(node.toSql(), "limit 10");

    parser = new SqlParser("limit num");
    node = parser.parseLimitNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlLimitNode);
    Assert.isEqual(node.value, "limit");
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'num');
    Assert.isEqual(node.toSql(), "limit num");

    parser = new SqlParser("limit 0, 10");
    node = parser.parseLimitNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlLimitNode);
    Assert.isEqual(node.value, "limit");
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlNumberNode);
    Assert.isTrue(node.nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[0].value, '0');
    Assert.isEqual(node.nodes[1].value, '10');
    Assert.isEqual(node.toSql(), "limit 0, 10");
});

Assert.runCase('parse order by', function () {
    let parser = new SqlParser("order by id");
    let node = parser.parseOrderByNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlOrderByNode);
    Assert.isEqual(node.value, "order by");
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlOrderNode);
    Assert.isEqual(node.nodes[0].value, null);
    Assert.isEqual(node.nodes[0].nodes.length, 1);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, 'id');
    Assert.isEqual(node.toSql(), "order by id");

    parser = new SqlParser("order by a desc, b + c");
    node = parser.parseOrderByNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlOrderByNode);
    Assert.isEqual(node.value, "order by");
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlOrderNode);
    Assert.isTrue(node.nodes[1] instanceof SqlOrderNode);
    Assert.isEqual(node.nodes[0].value, 'desc');
    Assert.isEqual(node.nodes[0].nodes.length, 1);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, 'a');
    Assert.isEqual(node.nodes[1].value, null);
    Assert.isEqual(node.nodes[1].nodes.length, 1);
    Assert.isTrue(node.nodes[1].nodes[0] instanceof SqlExpAddNode);
    Assert.isEqual(node.nodes[1].nodes[0].value, '+');
    Assert.isTrue(node.nodes[1].nodes[0].nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[1].nodes[0].nodes[1] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[1].nodes[0].nodes[0].value, 'b');
    Assert.isEqual(node.nodes[1].nodes[0].nodes[1].value, 'c');
    Assert.isEqual(node.toSql(), "order by a desc, b + c");
});

Assert.runCase('parse group by', function () {
    let parser = new SqlParser("group by date");
    let node = parser.parseGroupByNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlGroupByNode);
    Assert.isEqual(node.value, "group by");
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'date');
    Assert.isEqual(node.toSql(), "group by date");

    parser = new SqlParser("group by cust_id, date");
    node = parser.parseGroupByNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlGroupByNode);
    Assert.isEqual(node.value, "group by");
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[1] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'cust_id');
    Assert.isEqual(node.nodes[1].value, 'date');
    Assert.isEqual(node.toSql(), "group by cust_id, date");
});

Assert.runCase('parse having', function () {
    let parser = new SqlParser("having count(*) > 1");
    let node = parser.parseHavingNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlHavingNode);
    Assert.isEqual(node.value, "having");
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlExpRelNode);
    Assert.isEqual(node.nodes[0].value, '>');
    Assert.isEqual(node.nodes[0].nodes.length, 2);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlExpFuncNode);
    Assert.isTrue(node.nodes[0].nodes[1] instanceof SqlNumberNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, 'count');
    Assert.isEqual(node.nodes[0].nodes[0].nodes.length, 1);
    Assert.isTrue(node.nodes[0].nodes[0].nodes[0] instanceof SqlParamsNode);
    Assert.isEqual(node.nodes[0].nodes[0].nodes[0].nodes.length, 1);
    Assert.isTrue(node.nodes[0].nodes[0].nodes[0].nodes[0] instanceof SqlStarNode);
    Assert.isEqual(node.nodes[0].nodes[0].nodes[0].nodes[0].value, '*');
    Assert.isEqual(node.toSql(), "having count(*) > 1");
});

Assert.runCase('parse join', function () {
    let parser = new SqlParser("join dict c on c.id=t.gender_id");
    let node = parser.parseJoinNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlJoinNode);
    Assert.isEqual(node.value, "join");
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlTableNode);
    Assert.isTrue(node.nodes[1] instanceof SqlExpEqNode);
    Assert.isEqual(node.nodes[0].value, 'c');
    Assert.isEqual(node.nodes[0].nodes.length, 1);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, 'dict');
    Assert.isEqual(node.nodes[1].value, '=');
    Assert.isEqual(node.nodes[1].nodes.length, 2);
    Assert.isTrue(node.nodes[1].nodes[0] instanceof SqlExpRefNode);
    Assert.isEqual(node.nodes[1].nodes[0].value, 'c.id');
    Assert.isTrue(node.nodes[1].nodes[1] instanceof SqlExpRefNode);
    Assert.isEqual(node.nodes[1].nodes[1].value, 't.gender_id');
    Assert.isEqual(node.toSql(), "join dict c on c.id = t.gender_id");

    parser = new SqlParser("left join dict c on c.id=t.gender_id");
    node = parser.parseJoinNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlJoinNode);
    Assert.isEqual(node.value, "left join");
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlTableNode);
    Assert.isTrue(node.nodes[1] instanceof SqlExpEqNode);
    Assert.isEqual(node.nodes[0].value, 'c');
    Assert.isEqual(node.nodes[0].nodes.length, 1);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, 'dict');
    Assert.isEqual(node.nodes[1].value, '=');
    Assert.isEqual(node.nodes[1].nodes.length, 2);
    Assert.isTrue(node.nodes[1].nodes[0] instanceof SqlExpRefNode);
    Assert.isEqual(node.nodes[1].nodes[0].value, 'c.id');
    Assert.isTrue(node.nodes[1].nodes[1] instanceof SqlExpRefNode);
    Assert.isEqual(node.nodes[1].nodes[1].value, 't.gender_id');
    Assert.isEqual(node.toSql(), "left join dict c on c.id = t.gender_id");
});

Assert.runCase('parse select', function () {
    let parser = new SqlParser("select * from t");
    let node = parser.parseSelectNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlSelectNode);
    Assert.isEqual(node.value, "select");
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlFieldsNode);
    Assert.isTrue(node.nodes[1] instanceof SqlFromNode);
    Assert.isEqual(node.toSql(), "select * from t");

    parser = new SqlParser("select id, t.name, case when status=1 then 'N' else 'D' end as status_name from employee t where id=1");
    node = parser.parseSelectNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlSelectNode);
    Assert.isEqual(node.value, "select");
    Assert.isEqual(node.nodes.length, 3);
    Assert.isTrue(node.nodes[0] instanceof SqlFieldsNode);
    Assert.isTrue(node.nodes[1] instanceof SqlFromNode);
    Assert.isTrue(node.nodes[2] instanceof SqlWhereNode);
    Assert.isEqual(node.toSql(), "select id, t.name, case when status = 1 then 'N' else 'D' end as status_name from employee t where id = 1");

    parser = new SqlParser(`
        select
            id,
            t.name,
            d.name as status_name,
            e.join_date
        from employee_info t
        join dict d on d.id = t.status
        left join employee_detail e on e.employee_id = t.id
        where id = 1 and e.department_id in (100, 200)
        `);
    node = parser.parseSelectNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlSelectNode);
    Assert.isEqual(node.value, "select");
    Assert.isEqual(node.line, 2);
    Assert.isEqual(node.nodes.length, 4);
    Assert.isTrue(node.nodes[0] instanceof SqlFieldsNode);
    Assert.isTrue(node.nodes[1] instanceof SqlFromNode);
    Assert.isTrue(node.nodes[2] instanceof SqlJoinsNode);
    Assert.isTrue(node.nodes[3] instanceof SqlWhereNode);

    Assert.isEqual(node.nodes[0].nodes.length, 4);
    Assert.isEqual(node.nodes[0].nodes[0].line, 3);
    Assert.isEqual(node.nodes[0].nodes[1].line, 4);
    Assert.isEqual(node.nodes[0].nodes[2].line, 5);
    Assert.isEqual(node.nodes[0].nodes[3].line, 6);

    Assert.isEqual(node.nodes[1].nodes.length, 1);
    Assert.isEqual(node.nodes[1].nodes[0].value, 't');
    Assert.isEqual(node.nodes[1].nodes[0].line, 7);

    Assert.isEqual(node.nodes[2].nodes.length, 2);
    Assert.isEqual(node.nodes[2].nodes[0].value, 'join');
    Assert.isEqual(node.nodes[2].nodes[0].line, 8);
    Assert.isEqual(node.nodes[2].nodes[1].value, 'left join');
    Assert.isEqual(node.nodes[2].nodes[1].line, 9);

    Assert.isEqual(node.nodes[3].nodes.length, 1);
    Assert.isEqual(node.nodes[3].nodes[0].value, 'and');
    Assert.isEqual(node.nodes[3].nodes[0].line, 10);

    parser = new SqlParser("select distinct id, name from t");
    node = parser.parseSelectNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlSelectNode);
    Assert.isEqual(node.value, "select");
    Assert.isEqual(node.nodes.length, 3);
    Assert.isTrue(node.nodes[0] instanceof SqlModifiersNode);
    Assert.isTrue(node.nodes[1] instanceof SqlFieldsNode);
    Assert.isTrue(node.nodes[2] instanceof SqlFromNode);
    Assert.isTrue(node.nodes[0].nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].nodes[0].value, 'distinct');
    Assert.isEqual(node.toSql(), "select distinct id, name from t");

    //console.log(node.toString());
});

Assert.runCase('parse insert', function () {
    let parser = new SqlParser("insert into t_gender(id, name) values(1, 'Male')");
    let node = parser.parseInsertNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlInsertNode);
    Assert.isEqual(node.value, "insert into");
    Assert.isEqual(node.nodes.length, 3);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[1] instanceof SqlParamsNode);
    Assert.isTrue(node.nodes[2] instanceof SqlParamsNode);
    Assert.isEqual(node.nodes[0].value, 't_gender');
    Assert.isEqual(node.nodes[1].nodes.length, 2);
    Assert.isEqual(node.nodes[2].nodes.length, 2);
    Assert.isTrue(node.nodes[1].nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[1].nodes[1] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[2].nodes[0] instanceof SqlNumberNode);
    Assert.isTrue(node.nodes[2].nodes[1] instanceof SqlStringNode);
    Assert.isEqual(node.nodes[1].nodes[0].value, 'id');
    Assert.isEqual(node.nodes[1].nodes[1].value, 'name');
    Assert.isEqual(node.nodes[2].nodes[0].value, '1');
    Assert.isEqual(node.nodes[2].nodes[1].value, "'Male'");
    Assert.isEqual(node.toSql(), "insert into t_gender(id, name)values(1, 'Male')");

    parser = new SqlParser("insert into t_gender(id, name) values(?, ?)");
    node = parser.parseInsertNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlInsertNode);
    Assert.isEqual(node.value, "insert into");
    Assert.isEqual(node.nodes.length, 3);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[1] instanceof SqlParamsNode);
    Assert.isTrue(node.nodes[2] instanceof SqlParamsNode);
    Assert.isEqual(node.nodes[0].value, 't_gender');
    Assert.isEqual(node.nodes[1].nodes.length, 2);
    Assert.isEqual(node.nodes[2].nodes.length, 2);
    Assert.isTrue(node.nodes[1].nodes[0] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[1].nodes[1] instanceof SqlIdentityNode);
    Assert.isTrue(node.nodes[2].nodes[0] instanceof SqlExpHoldNode);
    Assert.isTrue(node.nodes[2].nodes[1] instanceof SqlExpHoldNode);
    Assert.isEqual(node.nodes[1].nodes[0].value, 'id');
    Assert.isEqual(node.nodes[1].nodes[1].value, 'name');
    Assert.isEqual(node.nodes[2].nodes[0].value, '?');
    Assert.isEqual(node.nodes[2].nodes[1].value, '?');
    Assert.isEqual(node.toSql(), "insert into t_gender(id, name)values(?, ?)");

    //console.log(node.toString());
});

Assert.runCase('parse update', function () {
    let parser = new SqlParser("update t_gender set deleted=1");
    let node = parser.parseUpdateNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlUpdateNode);
    Assert.isEqual(node.value, "update");
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlTableNode);
    Assert.isEqual(node.nodes[0].value, null);
    Assert.isEqual(node.nodes[0].nodes[0].value, 't_gender');
    Assert.isTrue(node.nodes[1] instanceof SqlParamsNode);
    Assert.isEqual(node.nodes[1].value, 'set');
    Assert.isTrue(node.nodes[1].nodes[0] instanceof SqlExpEqNode);
    Assert.isEqual(node.nodes[1].nodes[0].value, '=');
    Assert.isEqual(node.nodes[1].nodes[0].nodes.length, 2);
    Assert.isEqual(node.nodes[1].nodes[0].nodes[0].value, 'deleted');
    Assert.isEqual(node.nodes[1].nodes[0].nodes[1].value, '1');
    Assert.isEqual(node.toSql(), "update t_gender set deleted = 1");

    parser = new SqlParser("update t_gender t set deleted=1 where id=2");
    node = parser.parseUpdateNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlUpdateNode);
    Assert.isEqual(node.value, "update");
    Assert.isEqual(node.nodes.length, 3);
    Assert.isTrue(node.nodes[0] instanceof SqlTableNode);
    Assert.isEqual(node.nodes[0].value, 't');
    Assert.isEqual(node.nodes[0].nodes[0].value, 't_gender');
    Assert.isTrue(node.nodes[1] instanceof SqlParamsNode);
    Assert.isEqual(node.nodes[1].value, 'set');
    Assert.isTrue(node.nodes[1].nodes[0] instanceof SqlExpEqNode);
    Assert.isEqual(node.nodes[1].nodes[0].value, '=');
    Assert.isEqual(node.nodes[1].nodes[0].nodes.length, 2);
    Assert.isEqual(node.nodes[1].nodes[0].nodes[0].value, 'deleted');
    Assert.isEqual(node.nodes[1].nodes[0].nodes[1].value, '1');
    Assert.isTrue(node.nodes[2] instanceof SqlWhereNode);
    Assert.isEqual(node.toSql(), "update t_gender t set deleted = 1 where id = 2");

    //console.log(node.toString());
});

Assert.runCase('parse delete', function () {
    let parser = new SqlParser("delete from dict");
    let node = parser.parseDeleteNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlDeleteNode);
    Assert.isEqual(node.value, "delete from");
    Assert.isEqual(node.nodes.length, 1);
    Assert.isTrue(node.nodes[0] instanceof SqlTableNode);
    Assert.isEqual(node.nodes[0].value, null);
    Assert.isEqual(node.toSql(), "delete from dict");

    parser = new SqlParser("delete from dict where id = 1");
    node = parser.parseDeleteNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlDeleteNode);
    Assert.isEqual(node.value, "delete from");
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlTableNode);
    Assert.isTrue(node.nodes[1] instanceof SqlWhereNode);
    Assert.isEqual(node.nodes[0].value, null);
    Assert.isEqual(node.nodes[1].value, 'where');
    Assert.isEqual(node.toSql(), "delete from dict where id = 1");

    parser = new SqlParser("delete from dict t where t.id = 1");
    node = parser.parseDeleteNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlDeleteNode);
    Assert.isEqual(node.value, "delete from");
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlTableNode);
    Assert.isTrue(node.nodes[1] instanceof SqlWhereNode);
    Assert.isEqual(node.nodes[0].value, 't');
    Assert.isEqual(node.nodes[1].value, 'where');
    Assert.isEqual(node.toSql(), "delete from dict t where t.id = 1");

    //console.log(node.toString());
});

Assert.runCase('parse create table', function () {
    let parser = new SqlParser(`
        create table dict
        (
            id number,
            name varchar
        )
    `);
    let node = parser.parseCreateTableNode(null);
    Assert.isEqual(parser.errors.length, 0);
    Assert.isTrue(node instanceof SqlCreateTableNode);
    Assert.isEqual(node.value, "create table");
    Assert.isEqual(node.nodes.length, 2);
    Assert.isTrue(node.nodes[0] instanceof SqlIdentityNode);
    Assert.isEqual(node.nodes[0].value, 'dict');
    Assert.isTrue(node.nodes[1] instanceof SqlParamsNode);
    Assert.isEqual(node.nodes[1].value, ',');
    Assert.isEqual(node.nodes[1].nodes.length, 2);
    Assert.isTrue(node.nodes[1].nodes[0] instanceof SqlFieldDeclareNode);
    Assert.isTrue(node.nodes[1].nodes[1] instanceof SqlFieldDeclareNode);
    Assert.isEqual(node.nodes[1].nodes[0].value, 'id');
    Assert.isEqual(node.nodes[1].nodes[1].value, 'name');
    Assert.isEqual(node.nodes[1].nodes[0].nodes.length, 1);
    Assert.isEqual(node.nodes[1].nodes[1].nodes.length, 1);
    Assert.isEqual(node.nodes[1].nodes[0].nodes[0].value, 'number');
    Assert.isEqual(node.nodes[1].nodes[1].nodes[0].value, 'varchar');
    Assert.isEqual(node.toSql(), "create table dict(id number, name varchar)");

    //console.log(node.toString());
});