/* Chrjs-Store
 * A modular store for TiddlySpace
 *
 * See https://github.com/bengillies/chrjs.store for more
 *
 * Dependencies: chrjs library, jQuery, TiddlySpace
 *
 * Version: 0.2.3
 *
 * created by Ben Gillies
 * Chrjs-Store is distributed under a BSD License
 */

/* Taken and modified from ACE IDE to provide a lightweight RequireJS that
 * loads dependencies immediately, instead of inside a setTimeout (as RequireJS
 * does). See:
 * (https://github.com/mozilla/ace/blob/master/build_support/mini_require.js)
 * for the original version.
 *
 * ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Ajax.org Code Editor (ACE).
 *
 * The Initial Developer of the Original Code is
 * Ajax.org B.V.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *      Fabian Jakobs <fabian AT ajax DOT org>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * Define a module along with a payload
 * @param module a name for the payload
 * @param payload a function to call with (require, exports, module) params
 */

(function() {

if (window.require) {
    require.packaged = true;
    return;
}

var _define = function(module, deps, payload) {
    if (typeof module !== 'string') {
        if (_define.original)
            _define.original.apply(window, arguments);
        else {
            console.error('dropping module because define wasn\'t a string.');
            console.trace();
        }
        return;
    }

    if (arguments.length == 2)
        payload = deps;

    if (!define.modules)
        define.modules = {
            require: { payload: window.require, deps: [] },
            define: { payload: window.define, deps: [] },
            exports: { payload: {}, deps: [] },
            module: { payload: {}, deps: [] }
        };

    define.modules[module] = {
        payload: payload,
        deps: deps
    };
};
if (window.define)
    _define.original = window.define;

window.define = _define;


/**
 * Get at functionality define()ed using the function above
 */
var _require = function(module, callback) {
    if (Object.prototype.toString.call(module) === "[object Array]") {
        var params = [];
        for (var i = 0, l = module.length; i < l; ++i) {
            var dep = lookup(module[i]);
            if (!dep && _require.original)
                return _require.original.apply(window, arguments);
            params.push(dep);
        }
        if (callback) {
            callback.apply(null, params);
        }
    }
    else if (typeof module === 'string') {
        var payload = lookup(module);
        if (!payload && _require.original)
            return _require.original.apply(window, arguments);

        if (callback) {
            callback();
        }

        return payload;
    }
    else {
        if (_require.original)
            return _require.original.apply(window, arguments);
    }
};

if (window.require)
    _require.original = window.require;

window.require = _require;
require.packaged = true;

/**
 * Internal function to lookup moduleNames and resolve them by calling the
 * definition function if needed.
 */
var lookup = function(moduleName) {
    var mod = define.modules[moduleName],
        module = mod ? mod.payload : null,
        deps = mod ? mod.deps : null;
    if (module == null) {
        console.error('Missing module: ' + moduleName);
        return null;
    }

    if (typeof module === 'function') {
        var exports = {}, i, args = [], result;
        for (i = 0; i < deps.length; i++) {
            args.push(lookup(deps[i]));
        }
        if (args.length === 0) {
            args = [require, exports, { id: moduleName, uri: '' }];
        }
        result = module.apply(this, args);
        return result || exports;
    }

    return module;
};

})();
define('filter',['require','exports','module'],function() {

var Tiddlers;

// the Tiddlers object is a list of tiddlers that you can operate on/filter. Get a list by calling the Store instance as a function (with optional filter)
Tiddlers = function(store, tiddlers) {
	var self = [];
	self.store = store;
	if (tiddlers) {
		$.each(tiddlers, function(i, tiddler) {
			self.push(tiddler);
		});
	}

	// private functions
	var contains = function(field, match) {
		return (field && field.indexOf(match) !== -1) ? true : false;
	};

	// public functions
	$.extend(self, Tiddlers.fn);

	return self;
};

Tiddlers.fn = {
	tag: function(match) {
		return this.map(function(tiddler) {
			return contains(tiddler.tags, match) ? tiddler : null;
		});
	},
	text: function(match) {
		return this.map(function(tiddler) {
			return contains(tiddler.text, match) ? tiddler : null;
		});
	},
	title: function(match) {
		return this.map(function(tiddler) {
			return contains(tiddler.title, match) ? tiddler : null;
		});
	},
	attr: function(name, match) {
		var chkExists = (!match) ? true : false,
			getValue = function(tiddler) {
				return tiddler[name] || (tiddler.fields &&
					tiddler.fields[name]);
			};
		return this.map(function(tiddler) {
			if (chkExists) {
				return (getValue(tiddler)) ? tiddler : null;
			} else {
				return contains(getValue(tiddler), match) ? tiddler : null;
			}
		});
	},
	not: function(name, match) {
		var chkExists = (!match) ? true : false,
			getValue = function(tiddler) {
				return tiddler[name] || (tiddler.fields &&
					tiddler.fields[name]);
			};
		return this.map(function(tiddler) {
			if (chkExists) {
				return (getValue(tiddler)) ? null : tiddler;
			} else {
				return contains(getValue(tiddler), match) ? null : tiddler;
			}
		});
	},
	bag: function(name) {
		return this.map(function(tiddler) {
			var bag = tiddler.bag && tiddler.bag.name;
			return (bag === name) ? tiddler : null;
		});
	},
	// the space the tiddler originates from (i.e. not just included in)
	space: function(name) {
		var regex = /(_public|_private|_archive)$/;
		return this.map(function(tiddler) {
			var bag = tiddler.bag && tiddler.bag.name;
			return (bag.replace(regex, '') === name) ? tiddler : null;
		});
	},
	// no arguments matches the default recipe
	recipe: function(name) {
		var matchCurrent = (name === undefined) ? true : false, recipe;
		if (matchCurrent) {
			recipe = this.store.recipe.name;
		}
		return this.map(function(tiddler) {
			if (!matchCurrent) {
				recipe = tiddler.recipe && tiddler.recipe.name;
			}
			return (recipe === name) ? tiddler : null;
		});
	},
	// tiddlers that have been changed (i.e. not synced), lastSynced is optional and if present matches tiddlers that were synced before lastSynced
	dirty: function(lastSynced) {
		if (!lastSynced) {
			return this.map(function(tiddler) {
				return (tiddler.lastSync) ? null : tiddler;
			});
		} else {
			return this.map(function(tiddler) {
				if (tiddler.lastSync) {
					// return true if tiddler.lastSync is older than lastSynced
					return (+tiddler.lastSync < +lastSynced) ? tiddler :
						null;
				} else {
					return tiddler;
				}
			});
		}
	},
	each: function(fn) {
		var self = this;
		$.each(self, function(i, tiddler) {
			fn.apply(self, [tiddler, i]);
		});
		return self;
	},
	// returns a new instance of Tiddlers
	map: function(fn) {
		var self = this,
			result = Tiddlers(self.store);
		$.each(self, function(i, tiddler) {
			var mappedTiddler = fn.apply(self, [tiddler, i]);
			if (mappedTiddler) {
				result.push(mappedTiddler);
			}
		});
		return result;
	},
	// pass in an initial value and a callback. Callback gets tiddler and current result, and returns new result
	reduce: function(init, fn) {
		var result = init, self = this;
		$.each(self, function(i, tiddler) {
			result = fn.apply(self, [tiddler, result]);
		});
		return result;
	},
	// bind fn to the current set of matched tiddlers.
	bind: function(fn) {
		var self = this,
			bindFunc = function(tiddler) {
				fn.apply(self, [tiddler]);
			};
		self.each(function(tiddler) {
			self.store.bind('tiddler', tiddler.title, bindFunc);
		});
		return self;
	},
	// save tiddlers currently in list. Callback happens for each tiddler
	save: function(callback) {
		var self = this;
		$.each(self, function(i, tiddler) {
			self.store.save(tiddler, callback);
		});
		return self;
	},
	// add one or more tiddlers to the current Tiddlers object and the attached store
	add: function(tiddlers) {
		var self = this;
		if (tiddlers instanceof tiddlyweb.Tiddler) {
			self.push(tiddlers);
			self.store.add(tiddlers);
		} else {
			$.each(tiddlers, function(i, tiddler) {
				self.push(tiddler);
				self.store.add(tiddlers);
			});
		}
		return self;
	}
};

return Tiddlers;

});
define('event',['require','exports','module'],function() {

return function() {
	var binds = {
		recipe: { all: [] },
		bag: { all: [] },
		tiddler: { all: [] }
	};

	var result = {
		// takes thing to bind to (e.g. 'tiddler'), optional name (e.g. tiddler title), and callback that fires whenever object updates.
		// if name not present, then callbck fires whenever any object of that type updates.
		bind: function(type, name, callback) {
			if (binds[type]) {
				if (name) {
					if (!binds[type][name + type]) {
						binds[type][name + type] = [];
					}
					binds[type][name + type].push(callback);
				} else {
					binds[type].all.push(callback);
				}
			}
		},

		// same input as bind, though name and callback both optional. If callback present, any function the same (i.e. ===) as callback
		// will be removed.
		unbind: function(type, name, callback) {
			var stripCallback = function(list) {
				if (callback) {
					$.each(list, function(i, func) {
						if (callback === func) {
							list.splice(i, 1);
						}
					});
					return list;
				} else {
					return [];
				}
			};
			if ((binds[type]) && (name)) {
					binds[type][name + type] =
						stripCallback(binds[type][name + type]);
			} else {
				binds[type].all = stripCallback(binds[type].all);
			}
		},

		// fire an event manually. args is the object that gets passed into the event handlers
		trigger: function(type, name, args) {
			var message = ($.isArray(args)) ? args : [args];
			if (binds[type]) {
				$.each(binds[type].all, function(i, func) {
					func.apply(self, message);
				});
				if (name && binds[type][name + type]) {
					$.each(binds[type][name + type], function(i, func) {
						func.apply(self, message);
					});
				}
			}
		}
	};

	return result;
};

});
define('cache',['require','exports','module'],function() {

var isLocalStorage = (function() {
		try {
			return 'localStorage' in window && window['localStorage'] !== null;
		} catch(e) {
			return false;
		}
	}()),
	// construct an ID for use in localStorage
	getStorageID = function(tiddler) {
		return encodeURIComponent(tiddler.bag.name) + '/' +
			encodeURIComponent(tiddler.title);
	};

return {
	isCaching: isLocalStorage,
	set: function(tiddler) {
		var key = getStorageID(tiddler);
		if (isLocalStorage) {
			window.localStorage.setItem(key, tiddler.toJSON());
		}
	},
	get: function(tiddler) {
		var key = getStorageID(tiddler), result, tidJSON;
		if (isLocalStorage) {
			result = window.localStorage[key];
			tidJSON = $.parseJSON(result);
			result = new tiddlyweb.Tiddler(tiddler.title);
			result.bag = tiddler.bag;
			$.extend(result, tidJSON);
			return result;
		}
		return null;
	},
	remove: function(tiddler) {
		var key = getStorageID(tiddler);
		if (isLocalStorage) {
			window.localStorage.removeItem(key);
		}
	},
	list: function() {
		var tiddlers = [];
		if (isLocalStorage) {
			$.each(window.localStorage, function(i) {
				try {
					var key = window.localStorage.key(i), names, bagName, name,
						tiddlerJSON, tiddler;
					names = key.split('/');
					if (names.length !== 2) {
						throw "BadKey";
					}
					bagName = decodeURIComponent(names[0]);
					name = decodeURIComponent(names[1]);
					tiddlerJSON = $.parseJSON(window.localStorage[key]);
					tiddler = new tiddlyweb.Tiddler(name);
					tiddler.bag = new tiddlyweb.Bag(bagName, '/');
					$.extend(tiddler, tiddlerJSON);
					tiddlers.push(tiddler);
				} catch(e) {
					// not a chrjs-store cached tiddler
				}
			});
		}
		return tiddlers;
	},
	clear: function() {
		if (isLocalStorage) {
			window.localStorage.clear();
		}
	}
};

});
define('store',['filter', 'event', 'cache'], function(filter, events, cache) {

return function(tiddlerCallback, getCached) {
	if (getCached === undefined) {
		getCached = true;
	}

	var self,
		// private
		space = {
			name: '',
			type: 'private' // private or public (aka r/w or read only)
		},
		// setup the bind/unbind module
		ev = events(),
		// format bags or tiddlers suitable for storing
		resource = function(thing, isLocal) {
			var obj;
			if (thing instanceof tiddlyweb.Bag) {
				obj = {
					thing: thing, // bag object
					tiddlers: {}
				};
			} else {
				thing.lastSync = (!isLocal) ? new Date() : null;
				obj = thing;
			}

			return obj;
		},
		store = {},
		// remove items from the store that have already been deleted on the server
		removeDeleted = function(container, tiddlers) {
			var storeTids, newTiddlers = filter(self, tiddlers),
				deleted = [];
			newTiddlers = newTiddlers.map(function(tiddler) {
				return tiddler.title;
			});

			if (container instanceof tiddlyweb.Bag) {
				storeTids = store[container.name].tiddlers;
				$.each(storeTids, function(title, tiddler) {
					if (newTiddlers.indexOf(tiddler.title) === -1) {
						deleted.push([container.name, title]);
					}
				});
			} else if (container instanceof tiddlyweb.Recipe) {
				self.each(function(tiddler, title) {
					if ((tiddler.recipe &&
							tiddler.recipe.name === container.name) &&
							(newTiddlers.indexOf(tiddler.title) === -1)) {
						deleted.push([tiddler.bag.name, title]);
					}
				});
			}
			// deleted now contains everything tht has been deleted
			$.each(deleted, function(i, toDelete) {
				var title = toDelete[1], bag = toDelete[0],
					tiddler = store[bag].tiddlers[title];
				delete store[bag].tiddlers[title];
				self.trigger('tiddler', title, [tiddler, 'deleted']);
			});
		},
		replace;
	// add/replace the thing in the store object with the thing passed in.
	// different to add, which only adds to pending
	replace = function(thing) {
		if (thing instanceof tiddlyweb.Bag) {
			if (store[thing.name]) {
				store[thing.name].thing = thing;
			} else {
				store[thing.name] = resource(thing);
			}
			self.trigger('bag', thing.name, thing);
			return true;
		} else {
			// add the tiddler to the appropriate place in the store. If it comes with a new bag, add that as well
			var bagName = thing.bag.name,
				oldBag = (!store[bagName]) ? !replace(new tiddlyweb.Bag(bagName,
					'/')) : store[bagName],
				oldRevision = (!oldBag ||
					!oldBag.tiddlers[thing.title]) ? null :
					oldBag.tiddlers[thing.title].revision;
			store[bagName].tiddlers[thing.title] = resource(thing);
			if (thing.revision !== oldRevision) {
				self.trigger('tiddler', thing.title, thing);
			}
			return true;
		}
	};

	// public variables
	// take in an optional filter and return a Tiddlers object with the tiddlers that match it
	self = function(name, match) {
		var allTiddlers = filter(self);

		self.each(function(tiddler, title) {
			allTiddlers.push(tiddler);
		});

		if (allTiddlers[name]) {
			allTiddlers = allTiddlers[name](match);
		} else if (name) {
			allTiddlers = allTiddlers.attr(name, match);
		}

		// create new copies so any modifications do not affect the original
		allTiddlers = allTiddlers.map(function(tiddler) {
			return $.extend(true, new tiddlyweb.Tiddler(), tiddler);
		});

		return allTiddlers;
	};
	self.recipe = null;
	self.pending = {};

	// public functions

	// let filter be extensible
	self.fn = filter.fn;

	// takes in a  callback. calls callback with space object containing name and type or error
	self.getSpace = function(callback) {
		if (space.name !== '') {
			callback(space);
		} else {
			$.ajax({
				url: '/?limit=1', // get a tiddler from whatever is default
				dataType: 'json',
				success: function(data) {
					var recipeName = ((data instanceof Array) ? data[0].recipe :
							data.recipe) || 'No Recipe Found',
						match = recipeName.match(/^(.*)_(private|public)$/);
					if (match) {
						space.name = match[1];
						space.type = match[2];
						self.recipe = new tiddlyweb.Recipe(recipeName, '/');
						callback(space);
					} else {
						callback(null, {
							name: 'NoSpaceMatchError',
							message: data.recipe + ' is not a valid space'
						});
					}
				},
				error: function(xhr, txtStatus, err) {
					callback(null, err, xhr);
				}
			});
		}

		return self;
	};

	self.bind = function() {
		ev.bind.apply(self, arguments);

		return self;
	};

	self.unbind = function() {
		ev.unbind.apply(self, arguments);

		return self;
	};

	self.trigger = function() {
		ev.trigger.apply(self, arguments);

		return self;
	};

	// refresh tiddlers contained in the recipe.
	self.refresh = function(callback) {
		var getTiddlersSkinny = function(container) {
			var tiddlerCollection = container.tiddlers();
			tiddlerCollection.get(function(result) {
				$.each(result, function(i, tiddler) {
					replace(tiddler);
				});
				removeDeleted(container, result);
				if (callback) {
					callback.apply(self, [result]);
				}
			}, function(xhr, err, errMsg) {
				callback(null, {
					name: 'RetrieveTiddlersError',
					message: 'Error getting tiddlers: ' + errMsg
				}, xhr);
			});
		};

		if (self.recipe) {
			getTiddlersSkinny(self.recipe);
		} else {
			self.getSpace(function() {
				if (self.recipe) {
					getTiddlersSkinny(self.recipe);
				}
			});
		}

		return self;
	};

	// returns the tiddler, either directly if no callback, or fresh from the server inside the callback if given
	// returns pending first, then in recipe order (ie last bag first) if > 1 exist
	// render sets the render=1 flag on the GET request, server forces the function to return the server version
	self.get = function(tid, callback, render, server) {
		var pending = self.pending[tid] || self.pending[tid.title] || null,
			tiddler = (function() {
				var tiddler = (!server && pending) ? pending : tid;
				if (tiddler instanceof tiddlyweb.Tiddler) {
					return tiddler;
				}
				self.each(function(t, title) {
					if (title === tiddler) {
						tiddler = t;
						return false;
					}
				});
				return tiddler;
			}());

		if (!callback) {
			return $.extend(true, new tiddlyweb.Tiddler(), tiddler);
		} else if (!server && pending) {
			callback.call(self, $.extend(true, new tiddlyweb.Tiddler(),
				tiddler));
		} else if (tiddler) {
			tiddler.get(function(t) {
				replace(t);
				callback.call(self, $.extend(true, new tiddlyweb.Tiddler(), t));
			}, function(xhr, err, errMsg) {
				callback.call(self, null, {
					name: 'RetrieveTiddlersError',
					message: 'Error getting tiddler: ' + errMsg
				}, xhr);
			}, (render) ? 'render=1' : '');
		} else {
			callback.call(null, {
				name: 'NotFoundError',
				message: 'Tiddler not found'
			});
		}

		return self;
	};

	// loops over every thing (tiddler (default) or bag) and calls callback with them
	self.each = function(thing, cllbck) {
		var callback = (typeof thing === 'function') ? thing : cllbck,
			loopTiddlers = (thing === 'bag') ? false : true,
			loopOver = function(list, callback) {
				var finished = true, name;
				for (name in list) {
					if (list.hasOwnProperty(name)) {
						if (callback(list[name], name) === false) {
							finished = false;
							break;
						}
					}
				}
				return finished;
			};
		// loop over pending first
		if (loopTiddlers && !loopOver(self.pending, callback)) {
			return self;
		}
		loopOver(store, function(bag, bagName) {
			if (loopTiddlers) {
				if (!loopOver(store[bagName].tiddlers, callback)) {
					return false;
				}
			} else {
				if (callback(bag.thing, bagName) === false) {
					return false;
				}
			}
		});

		return self;
	};

	// add a tiddler to the store. Adds to pending (and localStorage).  will add whether a tiddler exists or not. Won't save until save
	// if bag is not present, will set bag to <space_name> + _public
	// if tiddler already in store[bag], will remove until saved to server
	self.add = function(tiddler) {
		var saveLocal = function(tiddler) {
			var tid;
			cache.set(tiddler);
			tid = $.extend( true, new tiddlyweb.Tiddler(), tiddler);
			self.pending[tid.title] = resource(tid, true);
			self.trigger('tiddler', tid.title, tid);
		};

		if (!tiddler.bag) {
			self.getSpace(function(space) {
				var bagName = space.name + '_public';
				tiddler.bag = (store[bagName] && store[bagName].thing) ||
					new tiddlyweb.Bag(bagName, '/');
				saveLocal(tiddler);
			});
		} else {
			saveLocal(tiddler);
		}

		return self;
	};

	// save any tiddlers in the pending object back to the server, and remove them from pending.
	// tiddler should be a tiddlyweb.Tiddler to save just that tiddler directly, or a callback to save all tiddlers in pending
	self.save = function(tiddler, cllbck) {
		var empty = true, isTiddler = (tiddler instanceof tiddlyweb.Tiddler),
			callback = (!isTiddler && tiddler) ? tiddler : cllbck,
			// do the actual saving bit
			saveTiddler = function(tiddler, callback) {
				delete self.pending[tiddler.title]; // delete now so that changes made during save are kept
				tiddler.put(function(response) {
					cache.remove(tiddler);
					response = resource(response);
					replace(response);
					callback(response);
				}, function(xhr, err, errMsg) {
					if (!self.pending[tiddler.title]) {
						// there was an error, so put it back (if it hasn't already been replaced)
						self.pending[tiddler.title] = resource(tiddler, true);
					}
					callback(null, {
						name: 'SaveError',
						message: 'Error saving ' + tiddler.title + ': ' + errMsg
					}, xhr);
				});
			};

		if (isTiddler) {
			saveTiddler(tiddler, callback);
			return self;
		}

		$.each(self.pending, function(i, tiddler) {
			if (empty) {
				empty = false;
			}
			saveTiddler(tiddler, callback);
		});
		if (empty) {
			callback(null, {
				name: 'EmptyError',
				message: 'Nothing to save'
			});
		}

		return self;
	};

	// remove a tiddler, either locally from pending, from the store, or delete from the server.
	// cllbck is optional. tid can be a tiddler object, a string with the title, or an object with the following:
	// tiddler, server (bool, delete from server), callback, pending (bool, delete pending)
	// default is don't delete from server, only remove pending
	self.remove = function(tid, cllbck) {
		var options = {
			pending: true,
			server: false,
			tiddler: tid,
			callback: cllbck || function() {}
		};

		if (typeof tid === 'string') {
			options.tiddler = self.get(tid);
		} else if (!(tid instanceof tiddlyweb.Tiddler)) {
			$.extend(options, tid);
		}

		if (!options.tiddler) {
			return self;
		} else {
			if (options.pending) {
				delete self.pending[options.tiddler.title];
				cache.remove(options.tiddler);
			}
			if (options.server) {
				options.tiddler['delete'](function(tiddler) {
					if (store[tiddler.bag.name]) {
						delete store[tiddler.bag.name].tiddlers[tiddler.title];
					}
					self.trigger('tiddler', tiddler.title, [tiddler, 'deleted']);
					options.callback(tiddler);
				}, function(xhr, err, errMsg) {
					options.callback((options.pending) ? options.tiddler : null,
						{
							name: 'DeleteError',
							message: 'Error deleting ' + options.tiddler.title +
								': ' + errMsg
					}, xhr);
				});
			} else {
				self.trigger('tiddler', options.tiddler.title, [options.tiddler,
					'deleted']);
				options.callback(options.tiddler);
			}
		}

		return self;
	};

	// import pending from localStorage
	self.retrieveCached = function() {
		$.each(cache.list(), function(i, tiddler) {
			self.add(tiddler);
		});

		return self;
	};

	// initialisation
	if (getCached) {
		self.retrieveCached();
	}
	if (tiddlerCallback) {
		self.refresh(tiddlerCallback);
	}

	return self;
};

});
(function(tiddlyweb) {

require(['store'], function(store) {

	tiddlyweb.Store = store;

});

}(window.tiddlyweb));
