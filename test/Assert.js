var Assert = /** @class */ (function () {
    function Assert() {
    }
    Assert.runCase = function (caseName, caseFn) {
        try {
            if (caseFn) {
                caseFn();
            }
            console.info((this.count++) + ' ' + caseName + " passed");
        }
        catch (e) {
            console.error(caseName + " failed\n" + e.stack);
        }
    };
    Assert.isTrue = function (actual) {
        Assert.isEqual(actual, true, false);
    };
    Assert.isFalse = function (actual) {
        Assert.isEqual(actual, false, false);
    };
    Assert.isEqual = function (actual, expect, ignoreError) {
        if (ignoreError === void 0) { ignoreError = false; }
        if (actual == expect) {
            return true;
        }
        var suc = false;
        if (actual && !expect) {
            suc = false;
        }
        else if (!actual && expect) {
            suc = false;
        }
        else if (typeof (actual) == "string" && typeof (expect) == "string") {
            suc = actual == expect;
        }
        else if (typeof (actual) == "string" && expect instanceof String) {
            suc = actual == expect.valueOf();
        }
        else if (actual instanceof String && typeof (expect) == "string") {
            suc = actual.valueOf() == expect;
        }
        else if (actual instanceof String && expect instanceof String) {
            suc = actual.valueOf() == expect.valueOf();
        }
        else if (typeof (actual) == "number" && typeof (expect) == "number") {
            suc = actual == expect;
        }
        else if (typeof (actual) == "number" && expect instanceof Number) {
            suc = actual == expect.valueOf();
        }
        else if (actual instanceof Number && typeof (expect) == "number") {
            suc = actual.valueOf() == expect;
        }
        else if (actual instanceof Number && expect instanceof Number) {
            suc = actual.valueOf() == expect.valueOf();
        }
        else if (typeof (actual) == "boolean" && typeof (expect) == "boolean") {
            suc = actual == expect;
        }
        else if (typeof (actual) == "boolean" && expect instanceof Boolean) {
            suc = actual == expect.valueOf();
        }
        else if (actual instanceof Boolean && typeof (expect) == "boolean") {
            suc = actual.valueOf() == expect;
        }
        else if (actual instanceof Boolean && expect instanceof Boolean) {
            suc = actual.valueOf() == expect.valueOf();
        }
        else if (actual instanceof Array && expect instanceof Array) {
            if (actual.length == expect.length) {
                suc = true;
                for (var i = 0; i < expect.length; i++) {
                    if (!Assert.isEqual(actual[i], expect[i], true)) {
                        suc = false;
                        break;
                    }
                }
            }
        }
        else if (actual instanceof Object && expect instanceof Object) {
            suc = true;
            for (var k in expect) {
                //console.log(typeof(actual)+"."+k+":"+typeof(actual[k]));
                if (!Assert.isEqual(actual[k], expect[k], true)) {
                    suc = false;
                    break;
                }
            }
        }
        else {
            suc = false;
        }
        if (suc) {
            return true;
        }
        if (ignoreError) {
            return false;
        }
        var expectStr = Assert.toDebugStr(expect);
        var actualStr = Assert.toDebugStr(actual);
        throw new Error("\r\nexpect: " + expectStr + "\r\nactual: " + actualStr);
    };
    Assert.toDebugStr = function (o, indent) {
        if (indent === void 0) { indent = ""; }
        var s = "";
        if (typeof (o) == "undefined") {
            s = "undefined";
        }
        else if (typeof (o) == "string" || o instanceof String) {
            s = '"' + o + '"';
        }
        else if (typeof (o) == "number" || typeof (o) == "boolean" || o instanceof Number || o instanceof Boolean) {
            s = o + "";
        }
        else if (o instanceof Array) {
            s = "[";
            for (var i in o) {
                s += Assert.toDebugStr(o[i], indent + "    ") + ", ";
            }
            if (s.length == 1) {
                return "[]";
            }
            return s.substr(0, s.length - 2) + "]";
        }
        else if (typeof (o) == "object") {
            s = "\n" + indent + "{";
            for (var i in o) {
                if (typeof (o[i]) == "object" && (i == "parent" || i == "childs" || i == "children" || i == 'nodes')) { //avoid cycle ref
                    s += "\n    " + indent + i + ": $" + i + ", ";
                }
                else if (typeof (o[i]) != "function") {
                    s += "\n    " + indent + i + ": " + Assert.toDebugStr(o[i], indent + "    ") + ", ";
                }
            }
            return s.substr(0, s.length - 2) + "\n" + indent + "}";
        }
        else if (typeof (o) != "function") {
            s = o + "";
        }
        return s;
    };
    Assert.count = 1;
    return Assert;
}());
