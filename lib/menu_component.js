
// ------------------------------- menuComponent ------------------------------- //

Template.menuComponent.onCreated(function () {

  var menu = this.data;
  
  // if menu has a custom item template specified, make that template inherit helpers and events from defaultMenuItem
  if (menu.itemTemplate) {
    Template[menu.itemTemplate].inheritsHelpersFrom("defaultMenuItem");
    Template[menu.itemTemplate].inheritsEventsFrom("defaultMenuItem");
  }

  var expandLevel = typeof menu.expandLevel === "undefined" ? 1 : menu.expandLevel;
  this.expanded = new ReactiveVar(expandLevel > 0 || expandLevel === "all");

});

Template.menuComponent.helpers({

  // generate menu's CSS class
  menuClass: function () {
    var classes = [this.menuName+"-menu"];
    var count = this.menuItems.length;


    if (!!this.menuType) {
      classes.push("menu-"+this.menuType);
    } else {
      classes.push("menu-list");
    }

    if (!!this.menuClass) {
      classes.push(this.menuClass);
    }

    if (count) {
      classes.push("menu-has-items");
    } else {
      classes.push("menu-no-items");
    }

    if (Template.instance().expanded.get()) {
      classes.push("menu-expanded");
    } else {
      classes.push("menu-collapsed");
    }

    return _.unique(classes).join(" ");
  },

  // whether to show the menu label or not
  showMenuLabel: function () {
    return !!this.menuLabelTemplate || !!this.menuLabel;
  },

  // whether to show the root menu items or not
  showRootMenuItems: function () {
    // if this is a dropdown or list menu, always show root menu items
    return this.menuType === "list" || this.menuType === "dropdown" || Template.instance().expanded.get();
  },

  // get the original set of root menu items
  rootMenuItems: function () {

    var menu = this;
    var menuItems = menu.menuItems;

    // get root elements
    menuItems = _.filter(menuItems, function(item) {
      return typeof item.parentId === "undefined";
    });
    
    // build "node container" object
    menuItems = _.map(menuItems, function (item) {
      return {
        menu: menu,
        level: 0,
        item: item
      };
    });
    
    return menuItems;

  }

});

Template.menuComponent.events({

  'click .js-menu-toggle': function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    var expanded = Template.instance().get("expanded");
    expanded.set(!expanded.get());
  }

});

// ------------------------------- defaultMenuLabel ------------------------------- //

Template.defaultMenuLabel.helpers({
  getMenuLabel: function () {
    return typeof this.menuLabel === "function" ? this.menuLabel() :  this.menuLabel;
  }
});

// ------------------------------- menuItem ------------------------------- //

Template.menuItem.onCreated(function () {

  // if menu item has a custom template specified, make that template inherit helpers from defaultMenuItem
  if (this.data.item.template) {
    Template[this.data.item.template].inheritsHelpersFrom("defaultMenuItem");
    Template[this.data.item.template].inheritsEventsFrom("defaultMenuItem");
  }

  var expandLevel = typeof this.data.menu.expandLevel === "undefined" ? 1 : this.data.menu.expandLevel;
  this.expanded = new ReactiveVar(this.data.item.isExpanded || this.data.level < expandLevel - 1 || expandLevel === "all");

});

Template.menuItem.helpers({

  // custom templates can be specified at the menu or menu item level
  getTemplate: function () {
    return this.item.template || this.menu.itemTemplate;
  },
  
  // generate item's CSS class
  itemClass: function () {
    var classes = [];
    var currentPath = getCurrentPath();
    var isActive = this.item.route && (getRoute(this.item) === currentPath || getRoute(this.item) === Meteor.absoluteUrl() + currentPath.substr(1));

    if (isActive) {
      // substr(1) is to avoid having two "/" in the URL
      classes.push("item-active");
    }

    if (getChildMenuItems(this).length) {
      classes.push("menu-item-has-children");
    } else {
      classes.push("menu-item-no-children");
    }

    if (Template.instance().expanded.get()) {
      classes.push("menu-expanded");
    } else {
      classes.push("menu-collapsed");
    }

    if (this.item.itemClass) {
      classes.push(this.item.itemClass);
    }

    classes.push("menu-level-" + this.level);
    
    return _.unique(classes).join(" ");;
  },

  showChildMenu: function () {
    // if this is a dropdown or list menu, always show children
    return this.menu.menuType === "list" || this.menu.menuType === "dropdown" || Template.instance().expanded.get();
  },

  // generate array of child menu items
  childMenuItems: function () {    
    return getChildMenuItems(this);
  }

});

// ------------------------------- defaultMenuItem ------------------------------- //

Template.defaultMenuItem.helpers({

  // the item's label
  getItemLabel: function () {
    return typeof this.item.label === "function" ? this.item.label() :  this.item.label;
  },

  // the item's description
  getItemDescription: function () {
    return typeof this.item.description === "function" ? this.item.description() :  this.item.description;
  },

  // the item's route
  itemRoute: function () {
    return getRoute(this.item);
  },

  // generate array of child menu items
  childMenuItems: function () {    
    return getChildMenuItems(this);
  }
});

Template.defaultMenuItem.events({

  'click .js-menu-toggle': function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    var expanded = Template.instance().get("expanded");
    expanded.set(!expanded.get());
  }

});