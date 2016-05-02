var MongoClient, Readable, SlowWritableStream, StreamCombine, TestStream, Writable, _, assert, async, checkSeries, flatTestData, linearTestData, randomTestData, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

_ = require("lodash");

assert = require("assert");

async = require("async");

MongoClient = require("mongodb").MongoClient;

ref = require("stream"), Readable = ref.Readable, Writable = ref.Writable;

StreamCombine = require("./index.js").default;

TestStream = (function(superClass) {
    extend(TestStream, superClass);

    function TestStream(serie1) {
        var j, len, point, ref1;
        this.serie = serie1;
        TestStream.__super__.constructor.call(this, {
            objectMode: true
        });
        ref1 = this.serie;
        for (j = 0, len = ref1.length; j < len; j++) {
            point = ref1[j];
            this.push(point);
        }
        this.push(null);
    }

    TestStream.prototype._read = function() {};

    return TestStream;

})(Readable);

SlowWritableStream = (function(superClass) {
    extend(SlowWritableStream, superClass);

    function SlowWritableStream() {
        SlowWritableStream.__super__.constructor.call(this, {
            objectMode: true
        });
    }

    SlowWritableStream.prototype._write = function(obj, encoding, cb) {
        return setTimeout((function(_this) {
            return function() {
                _this.emit("obj");
                return cb();
            };
        })(this), 1);
    };

    return SlowWritableStream;

})(Writable);

checkSeries = function(series, expected, done) {
    var sb, serie, str;
    str = "";
    sb = new StreamCombine((function() {
        var j, len, results;
        results = [];
        for (j = 0, len = series.length; j < len; j++) {
            serie = series[j];
            results.push(new TestStream(serie));
        }
        return results;
    })(), "_id");
    sb.on("data", function(data) {
        return str += JSON.stringify(data);
    });
    return sb.on("end", function() {
        if (expected) {
            assert.equal(str, expected);
        }
        return done();
    });
};

randomTestData = function() {
    var data, i, id, j, prevId, ref1;
    data = [];
    for (i = j = 1; j <= 1000; i = ++j) {
        prevId = ((ref1 = data[data.length - 1]) != null ? ref1._id : void 0) || Math.ceil(Math.random() * 10);
        id = prevId + Math.ceil(Math.random() * 10);
        data.push({
            _id: prevId + Math.ceil(Math.random() * 10),
            value: Math.round(Math.random() * 1000)
        });
    }
    return data;
};

flatTestData = function() {
    var data, i, j;
    data = [];
    for (i = j = 1; j <= 1000; i = ++j) {
        data.push({
            _id: i,
            value: i
        });
    }
    return data;
};

linearTestData = function() {
    var data, i, j, mutliplier, ref1, value;
    data = [];
    mutliplier = Math.random();
    for (i = j = 1, ref1 = Math.ceil(mutliplier * 10); 1 <= ref1 ? j <= ref1 : j >= ref1; i = 1 <= ref1 ? ++j : --j) {
        value = Math.floor(i * mutliplier * 4);
        data.push({
            _id: value,
            value: value
        });
    }
    return data;
};

describe("StreamCombine", function() {
    describe("constructor", function() {
        describe("when the streams argument is not defined", function() {
            return it("should throw an error", function(done) {
                assert.throws(function() {
                    return new StreamCombine;
                }, /Streams argument is required/);
                return done();
            });
        });
        describe("when streams is not an Array", function() {
            return it("should throw an error", function(done) {
                assert.throws(function() {
                    return new StreamCombine({});
                }, /Streams should be an Array/);
                return done();
            });
        });
        describe("when the streams array is empty", function() {
            return it("should throw an error", function(done) {
                assert.throws(function() {
                    return new StreamCombine([]);
                }, /Streams array should not be empty/);
                return done();
            });
        });
        return describe("when the key argument is not defined", function() {
            return it("should throw an error", function(done) {
                assert.throws(function() {
                    return new StreamCombine([1]);
                }, /Key argument is required/);
                return done();
            });
        });
    });
    describe("integration", function() {
        describe("one series of data", function() {
            return it("should be equal as expected", function(done) {
                var expected, series;
                series = [
                    [
                        {
                            _id: 1,
                            11: 11
                        }, {
                        _id: 2,
                        12: 12
                    }, {
                        _id: 3,
                        13: 13
                    }, {
                        _id: 4,
                        14: 14
                    }, {
                        _id: 5,
                        15: 15
                    }
                    ]
                ];
                expected = '{"data":[{"11":11,"_id":1}],"indexes":[0],"_id":1}{"data":[{"12":12,"_id":2}],"indexes":[0],"_id":2}{"data":[{"13":13,"_id":3}],"indexes":[0],"_id":3}{"data":[{"14":14,"_id":4}],"indexes":[0],"_id":4}{"data":[{"15":15,"_id":5}],"indexes":[0],"_id":5}';
                return checkSeries(series, expected, done);
            });
        });
        describe("two series of data", function() {
            describe("evenly distributed", function() {
                return it("should be equal as expected", function(done) {
                    var expected, series;
                    series = [];
                    series.push([
                        {
                            _id: 1,
                            11: 11
                        }, {
                            _id: 2,
                            12: 12
                        }, {
                            _id: 3,
                            13: 13
                        }, {
                            _id: 4,
                            14: 14
                        }, {
                            _id: 5,
                            15: 15
                        }
                    ]);
                    series.push([
                        {
                            _id: 1,
                            11: 11
                        }, {
                            _id: 2,
                            12: 12
                        }, {
                            _id: 3,
                            13: 13
                        }, {
                            _id: 4,
                            14: 14
                        }, {
                            _id: 5,
                            15: 15
                        }
                    ]);
                    expected = '{"data":[{"11":11,"_id":1},{"11":11,"_id":1}],"indexes":[0,1],"_id":1}{"data":[{"12":12,"_id":2},{"12":12,"_id":2}],"indexes":[0,1],"_id":2}{"data":[{"13":13,"_id":3},{"13":13,"_id":3}],"indexes":[0,1],"_id":3}{"data":[{"14":14,"_id":4},{"14":14,"_id":4}],"indexes":[0,1],"_id":4}{"data":[{"15":15,"_id":5},{"15":15,"_id":5}],"indexes":[0,1],"_id":5}';
                    return checkSeries(series, expected, done);
                });
            });
            return describe("unevenly distributed", function() {
                return it("should be equal as expected", function(done) {
                    var expected, series;
                    series = [];
                    series.push([
                        {
                            _id: 1,
                            11: 11
                        }, {
                            _id: 2,
                            12: 12
                        }, {
                            _id: 3,
                            13: 13
                        }, {
                            _id: 5,
                            15: 15
                        }
                    ]);
                    series.push([
                        {
                            _id: 2,
                            12: 12
                        }, {
                            _id: 3,
                            13: 13
                        }, {
                            _id: 4,
                            14: 14
                        }, {
                            _id: 5,
                            15: 15
                        }, {
                            _id: 5,
                            15: 15
                        }
                    ]);
                    expected = '{"data":[{"11":11,"_id":1}],"indexes":[0],"_id":1}{"data":[{"12":12,"_id":2},{"12":12,"_id":2}],"indexes":[0,1],"_id":2}{"data":[{"13":13,"_id":3},{"13":13,"_id":3}],"indexes":[0,1],"_id":3}{"data":[{"14":14,"_id":4}],"indexes":[1],"_id":4}{"data":[{"15":15,"_id":5},{"15":15,"_id":5}],"indexes":[0,1],"_id":5}{"data":[{"15":15,"_id":5}],"indexes":[1],"_id":5}';
                    return checkSeries(series, expected, done);
                });
            });
        });
        return describe("multiple series of data", function() {
            return describe("unevenly distributed", function() {
                it("should work", function(done) {
                    var series;
                    series = [
                        [
                            {
                                _id: 1,
                                11: 11
                            }, {
                            _id: 2,
                            12: 12
                        }, {
                            _id: 3,
                            13: 13
                        }, {
                            _id: 5,
                            15: 15
                        }
                        ], [
                            {
                                _id: 2,
                                12: 12
                            }, {
                                _id: 5,
                                15: 15
                            }, {
                                _id: 6,
                                15: 15
                            }
                        ], [
                            {
                                _id: 2,
                                12: 12
                            }, {
                                _id: 4,
                                14: 14
                            }
                        ], [
                            {
                                _id: 2,
                                12: 12
                            }, {
                                _id: 3,
                                13: 13
                            }, {
                                _id: 5,
                                15: 15
                            }, {
                                _id: 6,
                                15: 15
                            }
                        ]
                    ];
                    return checkSeries(series, null, done);
                });
                return it("should work", function(done) {
                    var series;
                    series = [
                        [
                            {
                                _id: 1,
                                value: 1
                            }, {
                            _id: 2,
                            value: 2
                        }, {
                            _id: 3,
                            value: 3
                        }, {
                            _id: 5,
                            value: 5
                        }
                        ], [
                            {
                                _id: 2,
                                value: 2
                            }, {
                                _id: 4,
                                value: 4
                            }, {
                                _id: 7,
                                value: 7
                            }, {
                                _id: 9,
                                value: 9
                            }, {
                                _id: 12,
                                value: 12
                            }, {
                                _id: 14,
                                value: 14
                            }, {
                                _id: 17,
                                value: 17
                            }
                        ]
                    ];
                    return checkSeries(series, null, done);
                });
            });
        });
    });
    describe("large amounts", function() {
        return describe("handle it", function() {
            it("should work with flat data", function(done) {
                var i, j, sb, serie, series;
                series = [];
                for (i = j = 1; j <= 4; i = ++j) {
                    series.push(flatTestData());
                }
                sb = new StreamCombine((function() {
                    var k, len, results;
                    results = [];
                    for (k = 0, len = series.length; k < len; k++) {
                        serie = series[k];
                        results.push(new TestStream(serie));
                    }
                    return results;
                })(), "_id");
                sb.on("data", function(data) {});
                return sb.on("end", function() {
                    return done();
                });
            });
            return it("should work with flat linear", function(done) {
                var i, j, sb, serie, series;
                series = [];
                for (i = j = 1; j <= 5; i = ++j) {
                    series.push(linearTestData());
                }
                sb = new StreamCombine((function() {
                    var k, len, results;
                    results = [];
                    for (k = 0, len = series.length; k < len; k++) {
                        serie = series[k];
                        results.push(new TestStream(serie));
                    }
                    return results;
                })(), "_id");
                sb.on("data", function(data) {});
                return sb.on("end", function() {
                    return done();
                });
            });
        });
    });
    describe("piped stream", function() {
        return describe("handle it - slow writable", function() {
            return it("should work with flat linear", function(done) {
                var count, i, j, sc, serie, series, sw;
                this.timeout(5000);
                series = [];
                for (i = j = 1; j <= 8; i = ++j) {
                    series.push(randomTestData());
                }
                sc = new StreamCombine((function() {
                    var k, len, results;
                    results = [];
                    for (k = 0, len = series.length; k < len; k++) {
                        serie = series[k];
                        results.push(new TestStream(serie));
                    }
                    return results;
                })(), "_id");
                sw = new SlowWritableStream;
                count = 0;
                sw.on("obj", function() {
                    if (++count === 2000) {
                        sc.unpipe();
                        return done();
                    }
                });
                return sc.pipe(sw);
            });
        });
    });
    return describe("mongodb cursor streams", function() {
        var collectionNames, count, database, i, now;
        count = 0;
        now = null;
        database = null;
        collectionNames = (function() {
            var j, results;
            results = [];
            for (i = j = 1; j <= 10; i = ++j) {
                results.push("test-" + i);
            }
            return results;
        })();
        before(function(done) {
            this.timeout(10000);
            return MongoClient.connect("mongodb://192.168.99.100:27017/stream-combine-test", function(error, db) {
                var insertTestData;
                if (error) {
                    throw error;
                }
                database = db;
                insertTestData = function(collectionName, cb) {
                    var testData;
                    testData = randomTestData();
                    return database.collection(collectionName, function(error, collection) {
                        if (error) {
                            return cb(error);
                        }
                        return collection.remove({}, function(error) {
                            if (error) {
                                return cb(error);
                            }
                            return collection.insertMany(testData, function(error) {
                                if (error) {
                                    return cb(error);
                                }
                                return cb();
                            });
                        });
                    });
                };
                return async.each(collectionNames, insertTestData, function(error) {
                    if (error) {
                        throw error;
                    }
                    now = Date.now();
                    console.log("inserted");
                    return done();
                });
            });
        });
        after(function(done) {
            this.timeout(10000);
            return database.dropDatabase(function(error) {
                if (error) {
                    throw error;
                }
                database.close();
                return done();
            });
        });
        return describe("stream all collections", function() {
            return it("should work", function(done) {
                var addCollectionStream, streams;
                this.timeout(10000);
                streams = [];
                addCollectionStream = function(collectionName, cb) {
                    return database.collection(collectionName, function(error, collection) {
                        if (error) {
                            return cb(error);
                        }
                        streams.push(collection.find().stream());
                        return cb();
                    });
                };
                return async.each(collectionNames, addCollectionStream, function(error) {
                    var sb;
                    if (error) {
                        throw error;
                    }
                    sb = new StreamCombine(streams, "_id");
                    sb.on("data", function(data) {
                        return count++;
                    });
                    sb.on("error", function(error) {
                        throw error;
                    });
                    return sb.on("end", function() {
                        var seconds;
                        seconds = (Date.now() - now) / 1000;
                        console.log((seconds.toFixed(2)) + " s, " + count + " elements, " + ((10000 / seconds).toFixed(2)) + " elements/s");
                        return done();
                    });
                });
            });
        });
    });
});

// ---
// generated by coffee-script 1.9.2