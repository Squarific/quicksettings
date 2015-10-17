(function() {
	var QuickSettings = {
		_topZ: 1,

		_panel: null,
		_titleBar: null,
		_content: null,
		_startX: 0,
		_startY: 0,
		_hidden: false,
		_collapsed: false,
		_controls: {},
		_keyCode: -1,
		_draggable: true,
		_collapsible: true,

		create: function(x, y, title) {
			var obj = Object.create(this);
			obj.init(x, y, title);
			return obj;
		},

		init: function(x, y, title) {this.bindHandlers();
			this.createPanel(x, y);
			this.createTitleBar(title || "QuickSettings");
			this.createContent();

			document.body.appendChild(this._panel);
		},

		bindHandlers: function() {
			this.startDrag = this.startDrag.bind(this);
			this.drag = this.drag.bind(this);
			this.endDrag = this.endDrag.bind(this);
			this.doubleClickTitle = this.doubleClickTitle.bind(this);
			this.onKeyUp = this.onKeyUp.bind(this);
		},

		createPanel: function(x, y) {
			this._panel = document.createElement("div");
			this._panel.className = "msettings_main";
			this.setPosition(x || 0, y || 0);
		},

		createTitleBar: function(text) {
			this._titleBar = document.createElement("div");
			this._titleBar.textContent = text;
			this._titleBar.className = "msettings_title_bar";

			this._titleBar.addEventListener("mousedown", this.startDrag);
			this._titleBar.addEventListener("dblclick", this.doubleClickTitle);

			this._panel.appendChild(this._titleBar);
		},

		createContent: function() {
			this._content = document.createElement("div");
			this._content.className = "msettings_content";
			this._panel.appendChild(this._content);
		},

		setPosition: function(x, y) {
			this._panel.style.left = x + "px";
			this._panel.style.top = y + "px";
		},

		setSize: function(w, h) {
			this._panel.style.width = w + "px";
			this._content.style.width = w + "px";
			this._content.style.height = (h - this._titleBar.offsetHeight) + "px";
		},

		setDraggable: function(draggable) {
			this._draggable = draggable;
			if(this._draggable || this._collapsible) {
				this._titleBar.style.cursor = "pointer";
			}
			else {
				this._titleBar.style.cursor = "default";
			}
		},

		setCollapsible: function(collapsible) {
			this._collapsible = collapsible;
			if(this._draggable || this._collapsible) {
				this._titleBar.style.cursor = "pointer";
			}
			else {
				this._titleBar.style.cursor = "default";
			}
		},

		startDrag: function(event) {
			this._panel.style.zIndex = ++QuickSettings._topZ;
			if(this._draggable) {
				document.body.addEventListener("mousemove", this.drag);
				document.body.addEventListener("mouseup", this.endDrag);
				this._startX = event.clientX;
				this.startY = event.clientY;
			}
			event.preventDefault();
		},

		drag: function(event) {
			var x = parseInt(this._panel.style.left),
				y = parseInt(this._panel.style.top),
				mouseX = event.clientX,
				mouseY = event.clientY;

			this.setPosition(x + mouseX - this._startX, y + mouseY - this.startY);
			this._startX = mouseX;
			this.startY = mouseY;
			event.preventDefault();
		},

		endDrag: function(event) {
			document.body.removeEventListener("mousemove", this.drag);
			document.body.removeEventListener("mouseup", this.endDrag);
			event.preventDefault();
		},

		doubleClickTitle: function() {
			if(this._collapsible) {
				this.toggleCollapsed();
			}
		},

		toggleCollapsed: function() {
			if(this._collapsed) {
				this.expand();
			}
			else {
				this.collapse();
			}
		},

		collapse: function() {
			this._panel.removeChild(this._content);
			this._collapsed = true;
		},

		expand: function() {
			this._panel.appendChild(this._content);
			this._collapsed = false;
		},

		hide: function() {
			this._panel.style.visibility = "hidden";
			this._hidden = true;
		},

		show: function() {
			this._panel.style.visibility = "visible";
			this._hidden = false;
		},

		setChangeHandler: function(handler) {
			this.changeHandler = handler;
		},

		createContainer: function() {
			var container = document.createElement("div");
			container.className = "msettings_container";
			return container;
		},

		createLabel: function(title) {
			var label = document.createElement("div");
			label.innerHTML = title;
			label.className = "msettings_label";
			return label;
		},

		setKey: function(char) {
			this._keyCode = char.toUpperCase().charCodeAt(0);
			document.body.addEventListener("keyup", this.onKeyUp);
		},

		onKeyUp: function(event) {
			if(event.keyCode === this._keyCode) {
				this.toggleVisibility();
			}
		},

		toggleVisibility: function() {
			if(this._hidden) {
				this.show();
			}
			else {
				this.hide();
			}
		},

		addRange: function(title, min, max, value, step, callback) {
			var container = this.createContainer();

			var range = document.createElement("input");
			range.type = "range";
			range.id = title;
			range.min = min || 0;
			range.max = max || 100;
			// range.step = step || 1;
			range.value = value || 0;
			range.className = "msettings_range";

			var label = this.createLabel("<b>" + title + ":</b> " + range.value);

			container.appendChild(label);
			container.appendChild(range);
			this._content.appendChild(container);
			this._controls[title] = range;

			var eventName = "input";
			if(this.isIE()) {
				eventName = "change";
			}
			range.addEventListener(eventName, function() {
				label.innerHTML = "<b>" + title + ":</b> " + range.value;
				if(callback) {
					callback(parseFloat(range.value));
				}
			});
		}, 

		isIE: function() {
			if(navigator.userAgent.indexOf("rv:11") != -1) {
				return true;
			}
			if(navigator.userAgent.indexOf("MSIE") != -1) {
				return true;
			}
			return false;
		},

		getRangeValue: function(title) {
			return this._controls[title].value;
		},

		addBoolean: function(title, value, callback) {
			var container = this.createContainer();

			var label = document.createElement("span");
			label.className = "msettings_label";
			label.textContent = title;

			var checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			checkbox.id = title;
			checkbox.checked = value;
			checkbox.className = "msettings_checkbox";

			container.appendChild(label);
			container.appendChild(checkbox);
			this._content.appendChild(container);
			this._controls[title] = checkbox;

			checkbox.addEventListener("change", function() {
				if(callback) {
					callback(checkbox.checked);
				}
			});
			label.addEventListener("click", function() {
				checkbox.checked = !checkbox.checked;
				if(callback) {
					callback(checkbox.checked);
				}
			});
		},

		getBoolean: function(title) {
			return this._controls[title].checked;
		},

		addButton: function(title, callback) {
			var container = this.createContainer();

			var button = document.createElement("input");
			button.type = "button";
			button.id = title;
			button.value = title

			container.appendChild(button);
			this._content.appendChild(container);
			this._controls[title] = button;

			button.addEventListener("click", function() {
				if(callback) {
					callback(button);
				}
			});
		},

		addColor: function(title, color, callback) {
			var container = this.createContainer();
			var label = this.createLabel("<b>" + title + ":</b> " + color);

			var colorInput = document.createElement("input");
			try {
				colorInput.type = "color";
			}
			catch(e) {
				colorInput.type = "text";
			}
			colorInput.id = title;
			colorInput.value = color || "#ff0000";
			colorInput.className = "msettings_color";

			container.appendChild(label);
			container.appendChild(colorInput);
			this._content.appendChild(container);
			this._controls[title] = colorInput;

			colorInput.addEventListener("input", function() {
				label.innerHTML = "<b>" + title + ":</b> " + colorInput.value;
				if(callback) {
					callback(colorInput.value);
				}
			});
		},

		getColor: function(title) {
			return this._controls[title].value;
		},

		addText: function(title, text, callback) {
			var container = this.createContainer();
			var label = this.createLabel("<b>" + title + "</b>");

			var textInput = document.createElement("input");
			textInput.type = "text";
			textInput.id = title;
			textInput.value = text || "";

			container.appendChild(label);
			container.appendChild(textInput);
			this._content.appendChild(container);
			this._controls[title] = textInput;

			textInput.addEventListener("input", function() {
				if(callback) {
					callback(textInput.value);
				}
			});
		}, 

		getText: function(title) {
			return this._controls[title].value;
		},

		addInfo: function(title, info) {
			var container = this.createContainer();
			container.innerHTML = info;
			this._content.appendChild(container);
		}
	};

	if (typeof define === "function" && define.amd) {
	    define(QuickSettings);
	} else {
	   window.QuickSettings = QuickSettings;
	}

}());