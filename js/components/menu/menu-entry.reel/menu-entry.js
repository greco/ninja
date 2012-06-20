/* <copyright>
This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
(c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
</copyright> */

var Montage = require("montage/core/core").Montage;
var Component = require("montage/ui/component").Component;

exports.MenuEntry = Montage.create(Component, {
    topHeader: {
        value: null
    },

    topHeaderText: {
        value: null
    },

    subEntries: {
        value: null
    },

    // Reference to the parent Menu component
    _menu: {
        value: null
    },

    menu: {
        get: function() {
            return this._menu;
        },
        set: function(value) {
            if(value !== this._menu) {
                this._menu = value;
            }
        }
    },

    _data: {
        value: null
    },

    data: {
        get: function() {
            return this._data;
        },
        set: function(value) {
            if(this._data !== value) {
                this._data = value;
            }
        }
    },

    select: {
        value: function() {
            this.element.classList.add("selected");
            this.subEntries.style.display = "block";
        }
    },

    deselect: {
        value: function() {
            this.element.classList.remove("selected");
            this.subEntries.style.display = "none";
        }
    },

    _menuIsActive: {
        value: false
    },

    menuIsActive: {
        get: function() {
            return this._menuIsActive;
        },
        set: function(value) {
            if(value)  this.element.addEventListener("mouseover", this, false);
        }
    },

    captureMousedown: {
        value: function(event) {
            // TODO: Hack! Rework this!
            this.parentComponent.ownerComponent.toggleActivation(this);
        }
    },

    handleMouseover: {
        value: function(event) {
            this.parentComponent.ownerComponent.activeEntry = this;
        }
    },

    prepareForDraw: {
        value: function() {

            this.subEntries.style.display = "none";

            this.topHeaderText.innerHTML = this.data.header;

            this.element.addEventListener("mousedown", this, true);
        }
    }
});