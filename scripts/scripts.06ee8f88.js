"use strict";
var app = angular.module("trovelistsApp", ["ngAnimate", "ngCookies", "ngResource", "ngRoute", "ngSanitize", "ngTouch", "picardy.fontawesome", "truncate", "infinite-scroll", "masonry"]);
app.config(["$routeProvider", "$sceDelegateProvider", function(a, b) {
    b.resourceUrlWhitelist(["**"]), a.when("/", {
        templateUrl: "views/main.html",
        controller: "MainCtrl",
        controllerAs: "mc"
    }).when("/reload/", {
        templateUrl: "views/main.html",
        controller: "ReloadCtrl",
        controllerAs: "rc"
    }).when("/topics/", {
        templateUrl: "views/lists.html",
        controller: "ListsCtrl",
        controllerAs: "lsc"
    }).when("/topics/:order", {
        templateUrl: "views/list.html",
        controller: "ListCtrl",
        controllerAs: "lc"
    }).when("/resources/", {
        templateUrl: "views/items.html",
        controller: "ItemsCtrl",
        controllerAs: "isc"
    }).when("/resources/:order", {
        templateUrl: "views/item.html",
        controller: "ItemCtrl",
        controllerAs: "ic"
    }).otherwise({
        redirectTo: "/"
    })
}]), app.controller("BaseCtrl", ["$scope", "$document", "$location", "$compile", function(a, b, c, d) {
    if (b.scrollTop(0), "undefined" == typeof a.exhibition) {
        a.listHide = !0, a.sort = "order", a.isActive = function(a) {
            var b = a === c.path();
            return b
        }, a.view = "list", a.exhibition = angular.element("#exhibition-name").html(), a.tagline = angular.element("#exhibition-tagline").html(), a.description = angular.element("#exhibition-description").html(), a.modeldescription = angular.element("#exhibition-model-description").html(), a.footer = angular.element("#exhibition-footer").html(), a.highlights = angular.element("#exhibition-highlights").html(), a.listLinks = angular.element(".list-link"), a.backgroundimages = $("div[id^=background-image]"), a.highlightimages = $("div[id^=highlights-image]");
        var e = $("div[id^=highlights-caption]");
        a.highlightcaptions = [];
        for (var f = 0; f < e.length; f++) a.highlightcaptions.push(e[f].innerHTML);
        a.config = window.config
    }
}]), app.controller("ReloadCtrl", ["$rootScope", "$location", function(a, b) {
    a.failed = !1, b.url("/")
}]), app.factory("ListsDataFactory", ["$rootScope", "$document", "$http", function(a, b, c) {
    var d = {},
        e = function(a, b, c, d) {
            var e = c.length + 1;
            return angular.forEach(a, function(a) {
                var f = {};
                f.order = e, f.list = b, f.listTitle = d, f.rank = .5 - Math.random(), angular.forEach(a, function(a, b) {
                    if ("article" === b) {
                        f.type = "newspaper", f.id = a.id, f.title = a.heading, f.newspaper = a.title.value, f.date = a.date;
                        try {
                            f.year = parseInt(f.date.toString().match(/^([12]{1}\d{3})[\-\.\w\s]*/)[1], 10)
                        } catch (c) {
                            f.year = 0
                        }
                        f.page = a.page, f.url = a.troveUrl
                    } else if ("work" === b) {
                        f.type = "work", f.title = a.title, f.id = a.id, f.format = a.type, f.type = f.format[0], f.url = a.troveUrl, f.date = a.issued, "undefined" != typeof a.contributor && (f.contributor = a.contributor);
                        try {
                            f.year = parseInt(f.date.toString().match(/^([12]{1}\d{3})[\-\.\w\s]*/)[1], 10)
                        } catch (c) {
                            f.year = 0
                        }
                        f.holdings = a.holdingsCount, angular.forEach(a.identifier, function(a) {
                            "thumbnail" === a.linktype ? (a.value.match(/.*nla.gov.au.*/) ? (f.thumbnail = a.value, f.thumbnail.indexOf("-t") > 0 && (f.thumbnail = f.thumbnail.substring(0, f.thumbnail.length - 2) + "-v")) : f.thumbnail = a.value, (f.thumbnail = f.thumbnail.substring(0, f.thumbnail.length))) : "fulltext" === a.linktype && (f.fulltext = a.value, "undefined" != typeof a.linktext && (f.linktext = a.linktext))
                        })
                    } else "externalWebsite" === b ? (f.type = "website", f.title = a.title, angular.isArray(a.identifier) ? f.url = a.identifier[0].value : f.url = a.identifier.value) : "note" === b ? f.note = a : "people" === b && (f.type = "people")
                }), "people" !== f.type && (c.push(f), e++)
            }), c
        },
        f = function(a, b) {
            var c = {};
            return c.order = b, c.id = a.id, c.title = a.title, c.numberOfItems = a.listItemCount, c.description = a.description, "undefined" != typeof a.identifier && (a.identifier.value.match(/^http/) ? (c.thumbnail = a.identifier.value, c.thumbnail.indexOf("-t") > 0 && (c.thumbnail = c.thumbnail.substring(0, c.thumbnail.length - 2) + "-v")) : c.thumbnail = "http://trove.nla.gov.au" + a.identifier.value), [c, a.listItem]
        };
    return d.getPromises = function() {
        console.log("Getting...");
        var a = angular.element(".list-link"),
            b = [];
        return angular.forEach(a, function(a) {
            var d = angular.element(a).attr("href").match(/id=(\d+)/)[1],
                e = c.jsonp(troveApiUrl + "/list/" + d + "?encoding=json&reclevel=full&include=listItems&key=" + window.troveAPIKey + "&callback=JSON_CALLBACK", {
                    cache: !0
                });
            b.push(e)
        }), b
    }, d.loadResources = function(b) {
        var c = 1,
            d = [],
            g = [];
        angular.forEach(b, function(a) {
            var b = f(a.data.list[0], c);
            d = e(b[1], c, d, b[0].title), g.push(b[0]), c++
        }), a.items = d, a.lists = g
    }, d
}]), app.filter("findById", function() {
    return function(a, b) {
        for (var c = 0; c < a.length; c++)
            if (+a[c].order === +b) return a[c]
    }
}), app.filter("itemsInList", function() {
    return function(a, b) {
        for (var c = [], d = 0; d < a.length; d++) + a[d].list === +b && c.push(a[d]);
        return c
    }
}), app.filter("itemsWithThumbnails", function() {
    return function(a) {
        for (var b = [], c = 0; c < a.length; c++) "undefined" != typeof a[c].thumbnail && b.push(a[c]);
        return b
    }
}), app.filter("randomItems", ["$filter", function(a) {
    return function(b, c) {
        var d = [],
            e = a("itemsWithThumbnails")(b);
        if (e.length > c)
            for (var f = 0; 10 > f; f++) {
                var g = Math.floor(Math.random() * e.length);
                d.push(e.splice(g, 1))
            } else d = e;
        return d
    }
}]), app.filter("dateFormat", ["$filter", function(a) {
    return function(b) {
        var c = "";
        if ("undefined" != typeof b) {
            var d = b.split("-");
            c = 1 === d.length ? b : 2 === d.length ? a("date")(b + "-01", "MMMM yyyy") : a("date")(b, "d MMMM yyyy")
        }
        return c
    }
}]), app.directive("elemReady", ["$parse", function(a) {
    return {
        restrict: "A",
        link: function(b, c, d) {
            c.ready(function() {
                b.$apply(function() {
                    var c = a(d.elemReady);
                    c(b)
                })
            })
        }
    }
}]), angular.module("trovelistsApp").controller("MainCtrl", ["$scope", "$rootScope", "$routeParams", "$document", "$filter", "$http", "$q", "ListsDataFactory", function(a, b, c, d, e, f, g, h) {
    if (d.scrollTop(0), "undefined" == typeof b.items && b.failed !== !0) {
        var i = 1,
            j = function() {
                var a = h.getPromises();
                g.all(a).then(function(a) {
                    h.loadResources(a)
                }, function(a) {
                    1 > i ? (i++, j()) : b.failed = !0
                })
            };
        j()
    }
}]), angular.module("trovelistsApp").controller("ListsCtrl", ["$scope", "$rootScope", "$routeParams", "$document", "$filter", "$http", "$q", "$location", "ListsDataFactory", function(a, b, c, d, e, f, g, h, i) {
    if (d.scrollTop(0), "undefined" == typeof b.items && b.failed !== !0) {
        var j = 1,
            k = function() {
                var a = i.getPromises();
                g.all(a).then(function(a) {
                    i.loadResources(a)
                }, function() {
                    1 > j ? (j++, k()) : b.failed = !0
                })
            };
        k()
    } else b.failed === !0 && h.url("/")
}]), angular.module("trovelistsApp").controller("ListCtrl", ["$scope", "$rootScope", "$routeParams", "$document", "$filter", "$http", "$q", "$location", "ListsDataFactory", function(a, b, c, d, e, f, g, h, i) {
    d.scrollTop(0), a.closeTertiary = function() {
        $(".popup-highlights").removeClass("is-visible"), $("#resources-header, #resources-secondary").css({
            display: "block"
        }), $(".resources, .featured").css({
            overflow: "scroll"
        })
    }, a.displayPrevTertiary = function(b) {
        var c = a.listitems.indexOf(a.item) - 1;
        0 >= c && (c = a.listitems.length - 1), a.displayTertiary(c, b)
    }, a.displayNextTertiary = function(b) {
        var c = a.listitems.indexOf(a.item) + 1;
        c >= a.listitems.length && (c = 0), a.displayTertiary(c, b)
    }, a.displayTertiary = function(b, c) {
        c.preventDefault(), a.isloading = !0;
        var d = a.listitems[b];
        if (a.item = d, $("#viewitemurl").attr("href", d.url), $(".itemdisplaytext").html(d.note), $(".popup-highlights").addClass("is-visible"), void 0 != d.thumbnail) {
            $("#itemimagesrc").css("display", "block");
            var e = $("#itemimagesrc")[0];
            e.src = "img/loading.gif";
            var f = new Image;
            f.onload = function() {
                e.src = this.src
            }, f.src = d.thumbnail
        } else $("#itemimagesrc").css("display", "none");
        $(".itemtitle").html(d.title), $(".itemdate").html(d.date), $(".itemtype").html(d.type), void 0 != d.newspaper ? $(".itemcaption").html("<p><em>" + d.newspaper + "</em>, page " + d.page + "</p>") : $(".itemcaption").html(""), showSlides(1), a.isloading = !1
    };
    a.showText = function(b) {
        "snippet" === b ? (a.displayText = e("words")(a.articleText, 100), a.fullText = !1) : (a.displayText = a.articleText, a.fullText = !0)
    }, a.nextList = function() {
        var a = parseInt(c.order, 10);
        a < b.lists.length && h.path("topics/" + (a + 1))
    }, a.previousList = function() {
        var a = parseInt(c.order, 10);
        1 !== a && h.url("topics/" + (a - 1))
    };
    var j = function() {
        var d = e("findById")(b.lists, c.order),
            f = e("itemsInList")(b.items, d.order);
        a.list = d, a.listitems = f
    };
    if ("undefined" == typeof b.items && b.failed !== !0) {
        var k = 1,
            l = function() {
                var a = i.getPromises();
                g.all(a).then(function(a) {
                    i.loadResources(a), j()
                }, function() {
                    1 > k ? (k++, l()) : b.failed = !0
                })
            };
        l()
    } else b.failed === !0 ? h.url("/") : j()
}]), angular.module("trovelistsApp").controller("ItemsCtrl", ["$scope", "$rootScope", "$routeParams", "$document", "$filter", "$http", "$q", "$location", "ListsDataFactory", function(a, b, c, d, e, f, g, h, i) {
    d.scrollTop(0), a.view = "list", a.totalDisplayed = 20, a.loadMore = function() {
        a.totalDisplayed < a.items.length && (a.totalDisplayed += 20)
    }, a.closeTertiary = function() {
        $(".popup-highlights").removeClass("is-visible"), $("#resources-header, #resources-secondary").css({
            display: "block"
        }), $(".resources, .featured").css({
            overflow: "scroll"
        })
    }, a.displayPrevTertiary = function(b) {
        var c = a.item.order - 1;
        0 >= c && (c = a.items.length), a.displayTertiary(c, b)
    }, a.displayNextTertiary = function(b) {
        var c = a.item.order + 1;
        c >= a.items.length && (c = 1), a.displayTertiary(c, b)
    }, a.displayTertiary = function(c, d) {
        d.preventDefault(), a.isloading = !0;
        var f = e("findById")(b.items, c);
        if (a.item = f, $("#viewitemurl").attr("href", f.url), $(".itemdisplaytext").html(f.note), $(".popup-highlights").addClass("is-visible"), void 0 != f.thumbnail) {
            $("#itemimagesrc").css("display", "block");
            var g = $("#itemimagesrc")[0];
            g.src = "img/loading.gif";
            var h = new Image;
            h.onload = function() {
                g.src = this.src
            }, h.src = f.thumbnail
        } else $("#itemimagesrc").css("display", "none");
        $(".itemtitle").html(f.title), $(".itemdate").html(f.date), $(".itemtype").html(f.type), void 0 != f.newspaper ? $(".itemcaption").html("<p><em>" + f.newspaper + "</em>, page " + f.page + "</p>") : $(".itemcaption").html(""), showSlides(1), a.isloading = !1
    };
    if (a.showText = function(b) {
            "snippet" === b ? (a.displayText = e("words")(a.articleText, 100), a.fullText = !1) : (a.displayText = a.articleText, a.fullText = !0)
        }, "undefined" == typeof b.items && b.failed !== !0) {
        var j = 1,
            k = function() {
                var a = i.getPromises();
                g.all(a).then(function(a) {
                    i.loadResources(a)
                }, function() {
                    1 > j ? (j++, k()) : b.failed = !0
                })
            };
        k()
    } else b.failed === !0 && h.url("/")
}]), angular.module("trovelistsApp").controller("ItemCtrl", ["$scope", "$rootScope", "$routeParams", "$document", "$filter", "$http", "$q", "$location", "ListsDataFactory", function(a, b, c, d, e, f, g, h, i) {
    d.scrollTop(0), a.nextItem = function() {
        var a = parseInt(c.order, 10);
        a < b.items.length && h.path("resources/" + (a + 1))
    }, a.previousItem = function() {
        var a = parseInt(c.order, 10);
        1 !== a && h.url("resources/" + (a - 1))
    }, a.showText = function(b) {
        "snippet" === b ? (a.displayText = e("words")(a.articleText, 100), a.fullText = !1) : (a.displayText = a.articleText, a.fullText = !0)
    };
    var j = function() {
        var d = e("findById")(b.items, c.order);
        a.item = d, "newspaper" === d.type ? f.jsonp(troveApiUrl + "/newspaper/" + d.id + "?encoding=json&reclevel=full&include=articletext&key=" + window.troveAPIKey + "&callback=JSON_CALLBACK", {
            cache: !0
        }).then(function(b) {
            a.articleText = b.data.article.articleText, a.words = b.data.article.wordCount, a.showText("snippet")
        }) : "work" === d.type && 1 === d.holdings && f.jsonp(troveApiUrl + "/work/" + d.id + "?encoding=json&reclevel=full&include=holdings&key=" + window.troveAPIKey + "&callback=JSON_CALLBACK", {
            cache: !0
        }).then(function(b) {
            var c;
            try {
                c = b.data.work.holding[0].nuc
            } catch (d) {}
            "undefined" != typeof c && f.jsonp(troveApiUrl + "/contributor/" + c + "?encoding=json&key=" + window.troveAPIKey + "&callback=JSON_CALLBACK", {
                cache: !0
            }).then(function(b) {
                a.repository = b.data.contributor.name.replace(/\.$/, "")
            })
        })
    };
    if ("undefined" == typeof b.items && b.failed !== !0) {
        var k = 1,
            l = function() {
                var a = i.getPromises();
                g.all(a).then(function(a) {
                    i.loadResources(a), j()
                }, function() {
                    1 > k ? (k++, l()) : (b.failed = !0, h.url("/"))
                })
            };
        l()
    } else b.failed === !0 ? h.url("/") : j()
}]), angular.module("trovelistsApp").run(["$templateCache", function(a) {
    a.put("views/item.html", '<div class="loading text-muted" ng-hide="lists"><fa name="spinner" size="5" spin></fa><br>Loading resources&hellip;</div> <div class="row" ng-show="item" ng-swipe-left="nextItem()" ng-swipe-right="previousItem()"> <div class="col-md-4 col-md-push-8" ng-if="item.type != \'newspaper\'"> <a ng-if="item.fulltext" href="{{ item.fulltext }}" title="View digitised item"><img ng-if="item.type != \'newspaper\' && item.thumbnail" ng-src="{{ item.thumbnail }}" class="thumbnail center-cropped-large"></a> <img ng-if="item.type != \'newspaper\' && item.thumbnail && !item.fulltext" ng-src="{{ item.thumbnail }}" class="thumbnail center-cropped-large"> </div> <div class="col-md-8 col-md-pull-4" ng-if="item.type != \'newspaper\'"> <h3>{{ item.title }}</h3> <p class="lead">{{ item.format[0]}}<span ng-if="item.date">, {{ item.date }}</span></p> <dl> <dt ng-if="item.format.length > 1">Additional formats</dt> <dd ng-if="item.format.length > 1"> <ul> <li ng-repeat="format in item.format.slice(1)">{{ format }}</li> </ul> </dd> <dt ng-if="item.contributor">Contributors</dt> <dd ng-if="item.contributor"> <ul> <li ng-repeat="contributor in item.contributor">{{ contributor }}</li> </ul> </dd> </dl> <p>Part of <a href="#/topics/{{ lists[item.list - 1].order }}">{{ lists[item.list - 1].title }}</a></p> <p><a href="{{ item.url }}">More details at Trove <fa name="external-link"></fa></a></p> <p ng-if="item.linktext && item.fulltext && config.directLinks === true"><a href="{{ item.fulltext }}">{{ item.linktext }} <fa name="external-link"></fa></a></p> <p ng-if="!item.linktext && item.fulltext && config.directLinks === true"><a href="{{ item.fulltext }}">View digitised item <span ng-if="repository">at {{ repository }} </span><fa name="external-link"></fa></a></p> <nav> <ul class="pager"> <li class="previous" ng-class="{disabled: item.order === 1}"><a ng-href="{{(item.order === 1) ? \'\' : \'#/resources/\' + (item.order - 1)}}"><span aria-hidden="true">&larr;</span> Previous</a></li> <li ng-class="{disabled: item.order === items.length}"><a ng-href="{{(item.order === items.length) ? \'\' : \'#/resources/\' + (item.order + 1)}}">Next <span aria-hidden="true">&rarr;</span></a></li> </ul> </nav> </div> <div class="col-md-8" ng-if="item.type == \'newspaper\'"> <h3>{{ item.title }}</h3> <p class="lead">{{ item.date | dateFormat }}</p> <p><em>{{ item.newspaper }}</em>, page {{ item.page }}</p> <p class="well" ng-if="item.note" ng-bind-html="item.note"></p> <p>Part of <a href="#/topics/{{ lists[item.list - 1].order }}">{{ lists[item.list - 1].title }}</a></p> <p><a href="{{ item.url }}">View digitised article at Trove <fa name="external-link"></fa></a></p> <nav> <ul class="pager"> <li class="previous" ng-class="{disabled: item.order === 1}"><a ng-href="{{(item.order === 1) ? \'\' : \'#/resources/\' + (item.order - 1)}}"><span aria-hidden="true">&larr;</span> Previous</a></li> <li ng-class="{disabled: item.order === items.length}"><a ng-href="{{(item.order == items.length) ? \'\' : \'#/resources/\' + (item.order + 1)}}">Next <span aria-hidden="true">&rarr;</span></a></li> </ul> </nav> </div> <div class="col-md-4" ng-if="item.type == \'newspaper\'"> <div class="newspaper-text" ng-bind-html="displayText"></div> <p ng-show="!fullText"><a href="" ng-click="showText()">Show all {{ words }} words</a> </p><p ng-show="fullText"><a href="" ng-click="showText(\'snippet\')">Show first 100 words</a></p> </div> </div>'), a.put("views/items.html", '<!-- RESOURCES INFORMATION --> <div class="resources w3-animate-bottom"> <div id="resources-header"> <h1>RESOURCES</h1> <ul class="resources-header-icons"> <li> <button class="resources-grid"> <img id="button-icon-grid" src="img/icon_grid-black.png" height="100%" width="100%"> </button> </li> <li> <button class="resources-list"> <img id="button-icon-list" src="img/icon-list.png" height="100%" width="100%"> </button> </li> </ul> </div> <div id="resources-secondary"> <ul> <li> <form id="orderBy" role="search">Order by: <select class="form-control" ng-model="sort"> <option class="orderOption" value="order">Topic</option> <option value="title">Title</option> <option value="year">Year</option> </select> </form> </li> <li> <form>Filter by: <input id="filterBy" type="search" placeholder="query" ng-model="query"></form> </li> </ul> </div> <div class="loading text-muted" ng-hide="items"><fa name="spinner" size="5" spin></fa><br>Loading resources&hellip;</div> <div> <div id="resources-list-container" ng-show="items"> <ul class="resources-grid"> <li ng-repeat="item in items | filter:query | orderBy:sort "> <div ng-click="displayTertiary(item.order,$event)" class="resource-grid-thumbnail resource-grid-thumbnail-div" style="background-image: url({{ item.thumbnail }});background-size:cover"></div> <a ng-click="displayTertiary(item.order,$event)" class="resources-grid-title">{{ item.title }}</a> <a ng-click="displayTertiary(item.order,$event)" class="resources-grid-type">{{ item.type}}</a> <a ng-click="displayTertiary(item.order,$event)" class="resources-grid-year">{{ item.date}}</a> </li> </ul> </div> </div> <!-- POPUP FOR EXHIBITION HIGHLIGHTS BELOW --> <div class="popup-highlights" role="alert"> <div class="tertiary-container"> <!-- ADD THE YOUR HIGHLIGHT IMAGES AND DESCRIPTIONS HERE --> <div class="item-slider-container"> <div id="highlights-slider"> <div class="highSlides"> <div class="loading text-muted" ng-show="isloading"><fa name="spinner" size="5" spin></fa><br>Loading resources&hellip;</div> <div id="item-header" ng-hide="isloading"> <h1 class="itemtitle"></h1> <h2 class="itemdate"></h2> <h3 class="itemtype"></h3> </div> <div id="item-details" ng-hide="isloading"> <img id="itemimagesrc" style="max-height: 100%; max-width: 100%; object-fit: contain; text-align:center"> <div class="list-item itemdisplaytext"> </div> <div class="list-item-caption itemcaption"></div> </div> </div> </div> <a id="itemprev" class="prev" ng-click="displayPrevTertiary($event)"><img src="img/icon_previous.png"> previous</a> <a id="itemnext" class="next" ng-click="displayNextTertiary($event)">next <img src="img/icon_next.png"></a> </div> <div style="text-align:center"> <span class="dot" onclick="currentSlide(1)"></span> <span class="dot" onclick="currentSlide(2)"></span> </div> <script src="js/high_slideshow.js"></script> <div id="list-item-links"> <h1><a id="viewitemurl" href="#">View digitised item at Trove <img src="img/icon-extLinks.png"></a></h1> <h2>Part of <a ng-href="#/topics/{{item.list}}" ng-click="closeTertiary()">{{item.listTitle}}</a></h2> </div> <img src="img/icon_close.png" height="100%" width="100%" class="tertiary-close"> </div> <div id="resources-footer"> <div id="resources-footer-main" ng-bind-html="footer"> </div> 
	<div id="featured-footer-secondary"> <img id="nla_logo" src="img/nla_logo.png"><a href="http://trove.nla.gov.au/"><img src="img/icon_logo.png"></a> <h3>Powered by <a href="http://trove.nla.gov.au/">Trove</a></h3> </div> </div> </div> <script src="js/grid-list-view.js"></script> <div id="resources-footer" class="resources-footer"> <div id="resources-footer-main" ng-bind-html="footer"> </div> 
	<div id="featured-footer-secondary"> <img id="nla_logo" src="img/nla_logo.png"><a href="http://trove.nla.gov.au/"><img src="img/icon_logo.png"></a> <h3>Powered by <a href="http://trove.nla.gov.au/">Trove</a></h3> </div> </div> </div> <script>$(document).ready(function() {\n  $(\'.resources\').css({\n' + "      'display': 'inline',\n  });\n  $('.featured').css({\n      'display': 'none',\n  });\n  $('.base-nav li:nth-child(2)').css({\n      'opacity': '0.5',\n  });\n  $('.base-nav li:nth-child(3)').css({\n      'opacity': '1',\n  });\n  $('.grid-trigger').attr('href','#/');\n});</script> <script src=\"js/popup_main.js\"></script>"), a.put("views/list.html", '<!-- RESOURCES INFORMATION --> <div class="resources" id="listresource"> <div id="featured-header"> <h1 style="width:90%">{{list.title}}</h1> <a ng-href="#/topics/" class="secondary-close"><img src="img/icon_close.png" height="100%" width="100%"></a> </div> <div id="resources-secondary"> <ul> <li> <form id="orderBy" role="search">Order by: <select class="form-control" ng-model="sort"> <option class="orderOption" value="order">Topic</option> <option value="title">Title</option> <option value="year">Year</option> </select> </form> </li> <li> <form>Filter by: <input id="filterBy" type="search" placeholder="query" ng-model="query"></form> </li> </ul> </div> <div class="loading text-muted" ng-hide="items"> <fa name="spinner" size="5" spin></fa><br>Loading resources&hellip;</div> <div> <div id="resources-list-container" ng-show="items"> <ul class="resources-list"> <li ng-repeat="item in listitems | itemsInList:list.order| filter:query | orderBy:sort "> <div ng-click="displayTertiary($index,$event)" class="resource-grid-thumbnail resource-grid-thumbnail-div" style="background-image: url({{ item.thumbnail }});background-size:cover"></div> <a ng-click="displayTertiary($index,$event)" class="resources-grid-title">{{ item.title }}</a> <a ng-click="displayTertiary($index,$event)" class="resources-grid-type">{{ item.type}}</a> <a ng-click="displayTertiary($index,$event)" class="resources-grid-year">{{ item.date}}</a> </li> </ul> </div> </div> <!-- POPUP FOR EXHIBITION HIGHLIGHTS BELOW --> <div class="popup-highlights" role="alert"> <div class="tertiary-container"> <!-- ADD THE YOUR HIGHLIGHT IMAGES AND DESCRIPTIONS HERE --> <div class="item-slider-container"> <div id="highlights-slider"> <div class="highSlides"> <div class="loading text-muted" ng-show="isloading"><fa name="spinner" size="5" spin></fa><br>Loading resources&hellip;</div> <div id="item-header" ng-hide="isloading"> <h1 class="itemtitle"></h1> <h2 class="itemdate"></h2> <h3 class="itemtype"></h3> </div> <div id="item-details" ng-hide="isloading"> <img id="itemimagesrc" style="max-height: 100%; max-width: 100%; object-fit: contain; text-align:center"> <div class="list-item itemdisplaytext"> </div> <div class="list-item-caption itemcaption"></div> </div> </div> </div> <a id="itemprev" class="prev" ng-click="displayPrevTertiary($event)"><img src="img/icon_previous.png"> previous</a> <a id="itemnext" class="next" ng-click="displayNextTertiary($event)">next <img src="img/icon_next.png"></a> </div> <div style="text-align:center"> <span class="dot" onclick="currentSlide(1)"></span> <span class="dot" onclick="currentSlide(2)"></span> </div> <script src="js/high_slideshow.js"></script> <div id="list-item-links"> <h1><a id="viewitemurl" href="#">View digitised item at Trove <img src="img/icon-extLinks.png"></a></h1> <h2>Part of <a ng-href="#/topics/{{list.order}}" ng-click="closeTertiary()">{{list.title}}</a></h2> </div> <img src="img/icon_close.png" height="100%" width="100%" class="tertiary-close"> </div> <div id="featured-footer"> <div id="resources-footer-main" ng-bind-html="footer"> </div> 
	<div id="featured-footer-secondary"> <img id="nla_logo" src="img/nla_logo.png"><a href="http://trove.nla.gov.au/"><img src="img/icon_logo.png"></a> <h3>Powered by <a href="http://trove.nla.gov.au/">Trove</a></h3> </div> </div> </div> <script src="js/grid-list-view.js"></script> <div id="resources-footer"> <div id="resources-footer-main" ng-bind-html="footer"> </div>
	<div id="featured-footer-secondary"> <img id="nla_logo" src="img/nla_logo.png"><a href="http://trove.nla.gov.au/"><img src="img/icon_logo.png"></a> <h3>Powered by <a href="http://trove.nla.gov.au/">Trove</a></h3> </div> </div> </div> <script>$(document).ready(function() {\n    $(\'.resources\').css({\n' + "      'display': 'inline',\n    });\n    $('.featured').css({\n      'display': 'none',\n    });\n    $('.base-nav li:nth-child(2)').css({\n      'opacity': '1',\n    });\n    $('.base-nav li:nth-child(3)').css({\n      'opacity': '0.5',\n    });\n\n  });</script> <script src=\"js/popup_main.js\"></script>"), a.put("views/lists.html", '<!-- FEATURED INFORMATION --> <div class="featured w3-animate-bottom" id="featured-div"> <div id="featured-header"> <h1>FEATURED</h1> <ul class="featured-header-icons"> <li> <button class="featured-grid"> <img id="button-icon-grid" src="img/icon_grid-black.png" height="100%" width="100%"> </button> </li> <li> <button class="featured-list"> <img id="button-icon-list" src="img/icon-list.png" height="100%" width="100%"> </button> </li> </ul> </div> <div class="loading text-muted" ng-hide="lists"><fa name="spinner" size="5" spin></fa><br>Loading resources&hellip;</div> <div id="featured-list-container" ng-show="lists"> <ul class="featured-grid"> <li ng-repeat="(id, list) in lists"> <a ng-href="#/topics/{{ list.order }}"> <!-- <div  class="featured-grid-thumbnail" style="background-image: url({{ list.thumbnail }});background-size:cover;">  </div> --> <img class="featured-grid-thumbnail" ng-if="list.thumbnail" ng-src="{{ list.thumbnail }}" alt="Thumbnail for {{ list.title }}" style="width:100%;height:100%"> </a> <a ng-href="#/topics/{{ list.order }}"><div class="featured-grid-title">{{ list.title }}</div></a> <a class="featured-grid-item-numbers" ng-href="#/topics/{{ list.order }}">Browse {{ list.numberOfItems}} items</a> <div class="featured-grid-description"> <p><div ng-if="list.description" ng-bind-html="list.description"></div> </p> </div> </li> </ul> </div> <script src="js/grid-list-view.js"></script> <div id="featured-footer"> <div id="featured-footer-main" ng-bind-html="footer"> </div> 
	<div id="featured-footer-secondary"> <img id="nla_logo" src="img/nla_logo.png"><a href="http://trove.nla.gov.au/"><img src="img/icon_logo.png"></a> <h3>Powered by <a href="http://trove.nla.gov.au/">Trove</a></h3> </div> </div> </div> <script>$(document).ready(function() {\n    $(\'.resources\').css({\n' + "      'display': 'none',\n    });\n    $('.featured').css({\n      'display': 'inline',\n    });\n    $('.base-nav li:nth-child(2)').css({\n      'opacity': '1',\n    });\n    $('.base-nav li:nth-child(3)').css({\n      'opacity': '0.5',\n    });\n    $('.grid-trigger').attr('href','#/');\n  });</script>"), a.put("views/main.html", '<!--    HOME SCREEN AND IMAGE SLIDER    --> <div id="main-div"> <main> <div class="slideshow-container"> <div id="header"> <ul> <li><a href="#0" class="popup-description-trigger"><img border="0" alt="Information icon" src="img/icon_info.png" width="100%" height="100%" align="middle" style="z-index:100 !important">INFORMATION</a></li> <li><a href="#0" class="popup-highlights-trigger">EXHIBITION HIGHLIGHTS<img border="0" alt="Exhibtiion Highlights icon" src="img/icon_museum.png" width="100%" height="100%" align="middle" style="z-index:100 !important"></a></li> </ul> </div> <div class="homeSlides" ng-repeat="backgroundimage in backgroundimages"> <img src="{{backgroundimage.innerHTML}}" height="100%" width="100%"> <div class="slide-caption"></div> </div> </div> <div style="text-align:center"> <span class="dot"></span> <span class="dot"></span> <span class="dot"></span> </div> <script src="js/popup_main.js"></script> <script type="text/javascript" src="js/slideshow.js"></script> </main> <!--    HOME SCREEN AND IMAGE SLIDER    --> <!--    POP UP FOR THE EXHIBITION DESCRIPTION    --> <div class="popup-description" role="alert"> <div class="popup-description-container"> <h1>{{exhibition}}</h1> <p>{{description}}</p> <div id="ex_high"><a href="#" class="exhigh-trigger"> <center>{{highlights}}</center> <img src="img/icon_arrow.png" height="40px" width="84px"></a> </div> <img class="popup-description-close" src="img/icon_close.png" height="100%" width="100%"> </div> </div> <!-- POPUP FOR EXHIBITION HIGHLIGHTS BELOW --> <div class="popup-highlights" role="alert"> <div class="popup-highlights-container"> <div id="highlights-header"> <div id="highlights-title">HIGHLIGHTS</div> <img class="popup-highlights-close" src="img/icon_close.png" height="100%" width="100%"> </div> <!-- ADD THE YOUR HIGHLIGHT IMAGES AND DESCRIPTIONS HERE --> <div class="highlights-slider-container"> <div class="loading text-muted" ng-hide="lists"><fa name="spinner" size="5" spin></fa><br>Loading resources&hellip;</div> <div id="highlights-slider" ng-show="lists"> <div class="highSlides" ng-repeat="highimage in highlightimages"> <div class="numbertext">{{$index+1}} / {{highlightimages.length}}</div> <img ng-src="{{ highimage.innerHTML }}" height="100%" width="100%"> <div class="highSlides-caption">{{highlightcaptions[$index]}}</div> </div> </div> <a class="prev" onclick="plusSlides(-1)"><img src="img/icon_previous.png"> <span style="vertical-align: top;display: inline-block;line-height: normal">previous</span></a> <a class="next" onclick="plusSlides(1)"><span style="vertical-align: top;display: inline-block;line-height: normal">next </span><img src="img/icon_next.png"></a> </div> <div style="text-align:center"> <span class="dot" ng-repeat="highimage in highlightimages" ng-click="currentSlide($index+1)"></span> </div> <script src="js/high_slideshow.js"></script> </div> </div> <script>$(document).ready(function() {\n    $(\'.resources\').css({\n' + "      'display': 'none',\n    });\n    $('.featured').css({\n      'display': 'none',\n    });\n    $('.base-nav li:nth-child(2)').css({\n      'opacity': '0.5',\n    });\n    $('.base-nav li:nth-child(3)').css({\n      'opacity': '0.5',\n    });\n  if (((navigator.userAgent.match(/OS X.*Safari/))|| (navigator.userAgent.match(/iPad/))) && ! navigator.userAgent.match(/Chrome/)) {\n     document.body.className += 'safari';\n  }\n  $('.grid-trigger').attr('href','#/topics');\n});</script> </div>")
}]);
