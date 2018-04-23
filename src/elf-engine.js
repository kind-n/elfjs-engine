/**
 * 
 * https://www.elfjs.org
 * 
 * @copyright 2018 Wu Hu. All Rights Reserved.
 * 
 * @version 2.0.0
 * @license MIT
 * 
 */
"use strict";

! (function (exports, NODE_ENV) {

    function wrong (error) {
        throw error;
    }
    function exists(value, name) {
        return isValid(value) && !isBasic(value) && (name in value);
    }
    function escape (value) {
        return value.replace(REGEXP_ESCAPED, function (item) {
            return "&" + htmlUnescapedMappings[item] + ";";
        });
    }
    function describe (name) {
        return {
            get : function () {
                return exists(this.attributes, name);
            },
            set : function (value) {
                if (value) {
                    this.attributes[name] = name;
                } else {
                    delete this.attributes[name];
                }
            }
        };
    }
    function isValid(value) {
        return value !== null && value !== void 0;
    }
    function isBasic(value) {
        return isString(value)
            || typeof value === "number"
            || typeof value === "boolean";
    }
    function isString (value) {
        return typeof value === "string";
    }
    function isObject (value) {
        return isValid(value)
            && typeof value === "object";
    }
    function isNullOrEmpty (value) {
        return !isString(value) || value === "";
    }

    function getHeadChildren (children) {
        return children.filter(function (item) {
            if (isObject(item) && isString(item.type)) {
                var type = item.type.toLowerCase();
                return type === "base"
                    || type === "link"
                    || type === "meta"
                    || type === "title"
                    || type === "style";
            }
            return false;
        });
    }
    function getBodyChildren (children) {
        return children.filter(function (item) {
            if (isObject(item) && isString(item.type)) {
                var type = item.type.toLowerCase();
                return type === "script";
            }
            return false;
        });
    }
    function getIntoChildren (children) {
        return children.filter(function (item) {
            if (isObject(item) && isString(item.type)) {
                var type = item.type.toLowerCase();
                return type !== "base"
                    && type !== "link"
                    && type !== "meta"
                    && type !== "title"
                    && type !== "style"
                    && type !== "script";
            }
            return true;
        });
    }

    function isDefaultNamespace (namespace) {
        return XHTMLNamespace === namespace;
    }
    function NOOP () {}

    function Text (textContent) {
        this.parentNode    = null;
        this.textContent   = String(textContent);
        this.ownerDocument = document;
    }
    Text.prototype.isDefaultNamespace = isDefaultNamespace;
    Object.defineProperty(Text.prototype, "outerHTML", {
        get : function () {
            return escape(this.textContent);
        }
    });

    function Comment (textContent) {
        this.parentNode    = null;
        this.textContent   = String(textContent);
        this.ownerDocument = document;
    }
    Comment.prototype.isDefaultNamespace = isDefaultNamespace;
    Object.defineProperty(Comment.prototype, "outerHTML", {
        get : function () {
            return "<!--" + escape(this.textContent) + "-->";
        }
    });

    function HTMLElement (namespace, localName) {
        this.parentNode    = null;
        this.ownerDocument = document;
        this.namespaceURI  = namespace;
        this.localName     = localName;
        this.style         = new CSSStyleDeclaration(this);
        this.childNodes    = [];
        this.attributes    = {};
    }
    HTMLElement.prototype.addEventListener    = NOOP;
    HTMLElement.prototype.removeEventListener = NOOP;
    HTMLElement.prototype.isDefaultNamespace  = isDefaultNamespace;
    HTMLElement.prototype.removeAttribute = function (name) {
        delete this.attributes[name];
    };
    HTMLElement.prototype.setAttribute = function (name, value) {
        this.attributes[name] = String(value);
    };
    HTMLElement.prototype.insertBefore = function (child, prev) {
        if (child.parentNode) {
            child.parentNode.removeChild(child);
        }
        if (prev) {
            if (prev.parentNode === this) {
                var index = this.childNodes.indexOf(prev);
                if (index >= 0) {
                    child.parentNode = this;
                    this.childNodes.splice(index, 0, child);
                    return;
                }
            }
            wrong(new Error("The node before which the new node is to be inserted is not a child of this node"));
        }
        child.parentNode = this;
        this.childNodes.push(child);
    };
    HTMLElement.prototype.removeChild = function (child) {
        if (child.parentNode === this) {
            var index = this.childNodes.indexOf(child);
            if (index >= 0) {
                child.parentNode = null;
                this.childNodes.splice(index, 1);
                return;
            }
        }
        wrong(new Error("The node to be removed is not a child of this node"));
    };
    Object.defineProperties(HTMLElement.prototype, {
        async : describe("async"),
        autoFocus : describe("autofocus"),
        autoplay : describe("autoplay"),
        checked : describe("checked"),
        controls: describe("controls"),
        "default": describe("default"),
        defer : describe("defer"),
        disabled : describe("disabled"),
        hidden : describe("hidden"),
        loop : describe("loop"),
        multiple : describe("multiple"),
        muted : describe("muted"),
        noValidate : describe("novalidate"),
        formNoValidate : describe("formnovalidate"),
        open : describe("open"),
        readOnly : describe("readonly"),
        required : describe("required"),
        reversed : describe("reversed"),
        scoped : describe("scoped"),
        selected : describe("selected"),
        className : {
            get : function () {
                return this.attributes["class"] || "";
            },
            set : function (value) {
                value = String(value);
                if (value) {
                    this.attributes["class"] = value;
                } else {
                    delete this.attributes["class"];
                }
            }
        },
        defaultValue : {
            get : function () {
                return this.attributes.value || "";
            },
            set : function (value) {
                if (!exists(this.attributes, "value")) {
                    this.attributes.value = value;
                }
            }
        },
        defaultChecked : {
            get : function () {
                return exists(this.attributes, "checked");
            },
            set : function (value) {
                if (!exists(this.attributes, "checked")) {
                    if (value) {
                        this.attributes.checked = "checked";
                    }
                }
            }
        },
        firstChild : {
            get : function () {
                return this.childNodes[0] || null;
            }
        },
        previousSibling : {
            get : function () {
                var parentNode = this.parentNode;
                if (parentNode) {
                    var index = parentNode.childNodes.indexOf(this);
                    if (index === 0) {
                        return null;
                    }
                    if (index > 0) {
                        return parentNode.childNodes[index - 1];
                    }
                    wrong(new Error("Unknow"));
                }
                return null;
            }
        },
        nextSibling : {
            get : function () {
                var parentNode = this.parentNode;
                if (parentNode) {
                    var index = parentNode.childNodes.indexOf(this);
                    if (index === parentNode.childNodes.length - 1) {
                        return null;
                    }
                    if (index < parentNode.childNodes.length - 1) {
                        return parentNode.childNodes[index + 1];
                    }
                    wrong(new Error("Unknown"));
                }
                return null;
            }
        },
        outerHTML : {
            get : function () {
                var html = "<" + this.localName;
                for (var name in this.attributes) {
                    html += " " + name + "=\"" + escape(this.attributes[name]) + "\"";
                }
                html += ">";
                if (exists(htmlElementSolitaries, this.localName)) {
                    return html;
                }
                if (exists(this, "innerHTML")) {
                    html += String(this.innerHTML);
                } else {
                    html += this.childNodes.map(function (item) {
                        return item.outerHTML;
                    }).join("");
                }
                html += "</" + this.localName + ">";
                return html;
            }
        }
    });
    function CSSStyleDeclaration (element) {
        this.element = element;
    };
    Object.defineProperty(CSSStyleDeclaration.prototype, "cssText", {
        get : function () {
            return this.element.attributes.style || "";
        },
        set : function (value) {
            value = String(value);
            if (value) {
                this.element.attributes.style = value;
            } else {
                delete this.element.attributes.style;
            }
        }
    });

    var REGEXP_ESCAPED = /(?:\x22|\x26|\x3c|\x3e|[\xa0-\xff])/g;
    var XHTMLNamespace = "http://www.w3.org/1999/xhtml";
    var htmlElementSolitaries = {
        area: 0,
        base: 0,
        br: 0,
        col: 0,
        embed: 0,
        hr: 0,
        img: 0,
        input: 0,
        keygen: 0,
        link: 0,
        menuitem: 0,
        meta: 0,
        param: 0,
        source: 0,
        track: 0,
        wbr: 0
    };
    var htmlUnescapedMappings = {
        "\x22": "quot",
        "\x26": "amp",
        "\x3c": "lt",
        "\x3e": "gt",
        "\xa0": "nbsp",
        "\xa1": "iexcl",
        "\xa2": "cent",
        "\xa3": "pound",
        "\xa4": "curren",
        "\xa5": "yen",
        "\xa6": "brvbar",
        "\xa7": "sect",
        "\xa8": "uml",
        "\xa9": "copy",
        "\xaa": "ordf",
        "\xab": "laquo",
        "\xac": "not",
        "\xad": "shy",
        "\xae": "reg",
        "\xaf": "macr",
        "\xb0": "deg",
        "\xb1": "plusmn",
        "\xb2": "sup2",
        "\xb3": "sup3",
        "\xb4": "acute",
        "\xb5": "micro",
        "\xb6": "para",
        "\xb7": "middot",
        "\xb8": "cedil",
        "\xb9": "sup1",
        "\xba": "ordm",
        "\xbb": "raquo",
        "\xbc": "frac14",
        "\xbd": "frac12",
        "\xbe": "frac34",
        "\xbf": "iquest",
        "\xc0": "Agrave",
        "\xc1": "Aacute",
        "\xc2": "Acirc",
        "\xc3": "Atilde",
        "\xc4": "Auml",
        "\xc5": "Aring",
        "\xc6": "AElig",
        "\xc7": "Ccedil",
        "\xc8": "Egrave",
        "\xc9": "Eacute",
        "\xca": "Ecirc",
        "\xcb": "Euml",
        "\xcc": "Igrave",
        "\xcd": "Iacute",
        "\xce": "Icirc",
        "\xcf": "Iuml",
        "\xd0": "ETH",
        "\xd1": "Ntilde",
        "\xd2": "Ograve",
        "\xd3": "Oacute",
        "\xd4": "Ocirc",
        "\xd5": "Otilde",
        "\xd6": "Ouml",
        "\xd7": "times",
        "\xd8": "Oslash",
        "\xd9": "Ugrave",
        "\xda": "Uacute",
        "\xdb": "Ucirc",
        "\xdc": "Uuml",
        "\xdd": "Yacute",
        "\xde": "THORN",
        "\xdf": "szlig",
        "\xe0": "agrave",
        "\xe1": "aacute",
        "\xe2": "acirc",
        "\xe3": "atilde",
        "\xe4": "auml",
        "\xe5": "aring",
        "\xe6": "aelig",
        "\xe7": "ccedil",
        "\xe8": "egrave",
        "\xe9": "eacute",
        "\xea": "ecirc",
        "\xeb": "euml",
        "\xec": "igrave",
        "\xed": "iacute",
        "\xee": "icirc",
        "\xef": "iuml",
        "\xf0": "eth",
        "\xf1": "ntilde",
        "\xf2": "ograve",
        "\xf3": "oacute",
        "\xf4": "ocirc",
        "\xf5": "otilde",
        "\xf6": "ouml",
        "\xf7": "divide",
        "\xf8": "oslash",
        "\xf9": "ugrave",
        "\xfa": "uacute",
        "\xfb": "ucirc",
        "\xfc": "uuml",
        "\xfd": "yacute",
        "\xfe": "thorn",
        "\xff": "yuml"
    }
    var document = {
        isDefaultNamespace : isDefaultNamespace,
        createAttributeNS  : function (namespace, localName) {
            return new HTMLElement(namespace, localName);
        },
        createTextNode     : function (textContent) {
            return new Text(textContent);
        },
        createComment      : function (textContent) {
            return new Comment(textContent);
        },
        createElement      : function (localName) {
            return new HTMLElement(XHTMLNamespace, localName);
        }
    };

    exports.renderToString = function (element) {
        var container = document.createElement("fragment");
        exports.render(element, container);
        return container.firstChild.outerHTML;
    };

    exports.redactByLayout = function (astObject) {
        return exports.redactElement(astObject, Array.prototype.slice(arguments, 1).concat([
            exports.Component("layout", {
                render : function () {
                    var template = "";
                    var location = this.props.href;
                    var children = this.props.children;
                    var filename = astObject.filename;
                    if (isNullOrEmpty(location) || isNullOrEmpty(filename)) {
                        wrong(new Error("Unable to calculate the path of layout"));
                    }
                    if (NODE_ENV) {
                        var path = require("path");
                        if (path.isAbsolute(location)) {
                            wrong(new Error("Layout href must be a relative path"));
                        }
                        template = require("fs").readFileSync(path.resolve(path.dirname(filename), location)).toString();
                    } else {
                        var path = exports.require;
                        if (typeof path !== "function") {
                            wrong(new Error("Layout needs to be introduced 'elfjs-loader' module"));
                        }
                        var sync = path(path.resolve(path.dirname(filename), location));
                        if (sync.status === "resolved") {
                            template = sync.result;
                        } else {
                            wrong(new Error("Layout needs to be loaded in advance"));
                        }
                        return exports.redactElement(template, [
                            exports.Component("head", {
                                render : function () {
                                    return exports.createElement("head", this.props, this.props.children.concat(getHeadChildren(children)));
                                }
                            }),
                            exports.Component("body", {
                                render : function () {
                                    return exports.createElement("body", this.props, this.props.children.concat(getBodyChildren(children)));
                                }
                            }),
                            exports.Component("outlet", {
                                render : function () {
                                    var into = getIntoChildren(children);
                                    if (into.length > 1) {
                                        return exports.createElement("div", this.props, into);
                                    } else {
                                        return into[0] || null;
                                    }
                                }
                            })
                        ]).call(this);
                    }
                    
                }
            })
        ]));
    };
} (
    typeof exports !== "undefined" ? module.exports = require("elfjs") : this.Elf,
    typeof history === "undefined"
));