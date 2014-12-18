(function (window, undefined) {
    "use strict";


    window.LocalRESTServerOptions = {};
    window.LocalRESTServerStorage = {};

    window.LocalRESTServer = function () {

    };

    window.LocalRESTServer.prototype.start = function (options) {
        LocalRESTServerOptions = options;
        window.origXMLHttpRequest = window.XMLHttpRequest;
        window.XMLHttpRequest = LocalXMLHttpRequest;
        if (options.seedData) {
            var localXMLHttpRequest = new LocalXMLHttpRequest();
            for (var i = 0; i < options.seedData.length; i++) {
                var seed = options.seedData[i];
                var parts = localXMLHttpRequest.getUrlParts(seed.url);
                if (seed.data.length) {
                    for (var s = 0; s < seed.data.length; s++) {
                        localXMLHttpRequest.storageMethods['POST'](parts, seed.data[s]);
                    }
                } else {
                    localXMLHttpRequest.storageMethods['POST'](parts, seed.data);
                }
            }
        }
    };

    window.LocalRESTServer.prototype.stop = function () {
        window.XMLHttpRequest = window.origXMLHttpRequest;
    };

    function LocalXMLHttpRequest() {
        this.error = false;
        this.sent = false;
        this.requestHeaders = {};
        this.responseHeaders = {};
        this.enabled = true;
        this.self = this;

        this._options = window.LocalRESTServerOptions || {};
        this._endpoints = this._options.endpoints || [];
        this.index = 0;

    }
    LocalXMLHttpRequest.prototype = {
        readyState: 0,
        status: 0,
        statusText: "",
        responseText: "",
        responseXML: "",
        UNSENT: 0,
        OPENED: 1,
        HEADERS_RECEIVED: 2,
        LOADING: 3,
        DONE: 4,
        statusReasons: {
            "100": 'Continue',
            "101": 'Switching Protocols',
            "102": 'Processing',
            "200": 'OK',
            "201": 'Created',
            "202": 'Accepted',
            "203": 'Non-Authoritative Information',
            "204": 'No Content',
            "205": 'Reset Content',
            "206": 'Partial Content',
            "207": 'Multi-Status',
            "300": 'Multiple Choices',
            "301": 'Moved Permanently',
            "302": 'Moved Temporarily',
            "303": 'See Other',
            "304": 'Not Modified',
            "305": 'Use Proxy',
            "307": 'Temporary Redirect',
            "400": 'Bad Request',
            "401": 'Unauthorized',
            "402": 'Payment Required',
            "403": 'Forbidden',
            "404": 'Not Found',
            "405": 'Method Not Allowed',
            "406": 'Not Acceptable',
            "407": 'Proxy Authentication Required',
            "408": 'Request Time-out',
            "409": 'Conflict',
            "410": 'Gone',
            "411": 'Length Required',
            "412": 'Precondition Failed',
            "413": 'Request Entity Too Large',
            "414": 'Request-URI Too Large',
            "415": 'Unsupported Media Type',
            "416": 'Requested range not satisfiable',
            "417": 'Expectation Failed',
            "422": 'Unprocessable Entity',
            "423": 'Locked',
            "424": 'Failed Dependency',
            "500": 'Internal Server Error',
            "501": 'Not Implemented',
            "502": 'Bad Gateway',
            "503": 'Service Unavailable',
            "504": 'Gateway Time-out',
            "505": 'HTTP Version not supported',
            "507": 'Insufficient Storage'
        },

        open: function (method, url, async, user, password) {
            this.method = method.toUpperCase();
            this.url = url;
            this.async = async;
            this.user = user;
            this.password = password;
            this.readyState = this.OPENED;
            this._urlParts = this.getUrlParts(url);
        },

        setRequestHeader: function (header, value) {
            header = header.toLowerCase();

            if (this.requestHeaders[header] === undefined)
                this.requestHeaders[header] = value;
            else {
                var prev = this.requestHeaders[header];
                this.requestHeaders[header] = prev + ", " + value;
            }
        },

        send: function (data) {
            this.error = false;
            this.sent = true;
            this.requestText = data;
            this.data = data;
            var result = this.storageMethods[this.method](this._urlParts, JSON.parse(data));
            if (result.status && result.error) {
                if (console && console.error) {
                    console.error('ERROR', result.error)
                }
                this.receive(404, result.error);
                return;
            }
            this.onsend(result);
        },

        getResponseHeader: function (header) {
            return this.responseHeaders[header.toLowerCase()];
        },

        getAllResponseHeaders: function () {
            var res = '';
            for (var header in this.responseHeaders) {
                res = +header + ": " + this.responseHeaders[header] + "\r\n";
            }
            return res;
        },

        onsend: function (data) {
            this.setResponseHeader("Content-Type", "application/robot");
            this.receive(200, data);
        },

        getRequestHeader: function (header) {
            return this.requestHeaders[header.toLowerCase()];
        },

        setResponseHeader: function (header, value) {
            this.responseHeaders[header.toLowerCase()] = value;
        },

        makeXMLResponse: function (data) {
            return 'xmlDoc';
        },
        receive: function (status, data) {
            this.status = status;
            this.statusText = status + " " + this.statusReasons[status];
            this.readyState = this.HEADERS_RECEIVED;
            this.responseText = data;
            this.body = data;
            this.data = data;
            this.responseXML = this.makeXMLResponse(data);
            this.readyState = this.LOADING;
            this.readyState = this.DONE;
            this.onload();
        },

        getUrlParts: function (url) {
            var endPoint = this.getEndpoint(url);
            if (endPoint) {
                var allParts = url.replace(endPoint, '');
                var queryString = allParts.split('?');
                var parts = queryString[0].split('/');
                return {
                    endPoint: endPoint,
                    parts: parts,
                    url: url
                }
            } else {
                return null;
            }
        },

        getEndpoint: function (url) {
            for (var i = 0; i <= this._endpoints.length; i++) {
                var endPoint = this._endpoints[i];
                if (url.indexOf(endPoint) > -1) {
                    return endPoint;
                }
            }
            return null;
        },
        storageMethods: {
            storage: {},
            index: 0,
            fetchObject: function (method, parts, createIfNotExists, fetchById) {
                if (!window.LocalRESTServerStorage[parts.endPoint])
                    window.LocalRESTServerStorage[parts.endPoint] = {};
                var obj = window.LocalRESTServerStorage[parts.endPoint];
                for (var i = 0; i < parts.parts.length; i++) {
                    var part = parts.parts[i];
                    if (!obj[part]) {
                        if (createIfNotExists) {
                            obj[part] = {};
                        } else {
                            return {
                                status: 404,
                                error: "Unable to perform " + method + " operation for provided endpoint: " +
                                    parts.url + ' - object created' + JSON.stringify(obj) + " " + part
                            };
                        }
                    }

                    if (fetchById && i == parts.parts.length - 1) {
                        return { obj: obj,part: part};
                    }

                    obj = obj[part];
                }
                return obj;
            },
            'GET': function (parts) {
                var obj = this.fetchObject('GET', parts);
                if (typeof obj === 'object') {
                    var arr = Object.keys(obj).map(function (k) {
                        return JSON.parse(obj[k]);
                    });
                    return JSON.stringify(arr);
                } else {
                    return obj;
                }
            },
            'POST': function (parts, data) {
                var obj = this.fetchObject('POST', parts, true);

                var newId = this.index++;
                data.id = newId.toString();
                obj[newId.toString()] = JSON.stringify(data);

                return obj[newId];
            },
            'PUT': function (parts, data) {
                var obj = this.fetchObject('PUT', parts, false, true);
                data.id = obj.part;
                obj.obj[obj.part] = JSON.stringify(data);
                return obj.obj[obj.part];
            },
            'DELETE': function (parts) {
                var obj = this.fetchObject('DELETE', parts, false, true);
                delete obj.obj[obj.part];
                return obj;
            }
        }

    };
})(window);