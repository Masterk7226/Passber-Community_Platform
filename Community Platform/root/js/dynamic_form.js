// Dynamic Form
// By MAK Kai Chung

// JSON Structure Format of a form:
// {
//     "memberType": "Universal Form - v1.0",
//     "fieldSet": [{
//         "type": "text_box",
//         "data": {
//             "label": "Text",
//             "data-type": 0,
//             "isRequired": false
//         }
//     }, {
//         "type": "number_field",
//         "data": {
//             "label": "Number",
//             "isRequired": false,
//             "max": 0,
//             "min": 0
//         }
//     }, {
//         "type": "text_area",
//         "data": {
//             "label": "Text Area",
//             "isRequired": false
//         }
//     }, {
//         "type": "radio_button_group",
//         "data": {
//             "option-list": ["A", "B", "C"],
//             "label": "Radio Button Group",
//             "isRequired": false
//         }
//     }]
// }
// Notes: 
// 1. Form Display & Dynamic Form use the same engine
// 2. something wrapped by $() means getting or creating the UI components / elements from the runing html

// Create a package for Dynamic Form
var DynamicForm = function () {
    // Extract the auto-saving back up forms from the browser local storage
    // Local storage  will not be deleted even when the browser closed unless user delete manually
    this.backupList = {};
    try {
        this.backupList = JSON.parse(localStorage["community-form-backup"]);
    } catch (error) {

    }

    // Global method to generate random ID for UI elements
    this.generateID = function (length, text) {
        if (text === undefined) {
            text = "";
        }
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length))
        }

        if ($("#" + text).length >= 1) {
            return generateID(length);
        }

        return text;
    }

    // Global method to convert miliseconds to readable ISO date format
    this.toISODate = function (ms) {
        if (isNaN(ms)) {
            return ["0000", "00", "00"].join("-") + " " + ["00", "00", "00"].join(":");
        }

        var date = new Date(ms);
        var year = date.getFullYear()
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hours = date.getHours();
        var mins = date.getMinutes();
        var seconds = date.getSeconds();
        var ISODate = [date, year, month, day, hours, mins, seconds];

        return [year, month, day].join("-") + " " + [hours, mins, seconds].join(":");
    }

    // Global method to generate random name for UI elements
    this.generateName = function (length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length))
        }

        if ($("*[name=" + text + "]").length >= 1) {
            return generateName(length);
        }

        return text;
    }

    // Form Save Controller class
    // In charge of saving form and control auto-saving function
    var FormSaveController = function () {
        this.ref; // Database reference that will be set in the main program
        // store the needed UI components as constants
        this.saveButton = $(".form-save-button");
        this.activateButton = $(".form-activate-button");
        this.additionalInfo = $("#additional-info");
        this.enabledWarning = false; // specify if it displays warning when leaving this page
        // Add a on click event listener to the save button UI element
        // trigger to save the entire form
        this.saveButton.on("click.save-form", {
            controller: this // bind this controller to the event
        }, function (event) {
            var saveController = event.data.controller;

            saveController.saveForm();
        });
    }
    // Method to save the current form to database
    FormSaveController.prototype.saveForm = function () {
        // get JSON object of the form object by using FormObjectController
        var jsonObject = DynamicForm.formObjectController.getJSONFromForm();

        // update isActivated attribute of the JSON object
        jsonObject.isActivated = this.activateButton.find('input[type="checkbox"]').prop("checked");
        jsonObject.lastModified = $.now();
        var date = DynamicForm.toISODate(jsonObject.lastModified);

        // Store the form record in database
        forms[formID] = jsonObject;
        this.ref.set(forms);
        // display last modified time on screen
        this.additionalInfo.find(".last-modified .modified-date").text(date);
        // Disable the warning of auto-saving detection
        this.disableSaveWarning();
    }
    // Method that in charge of backup form in the browser local storage
    FormSaveController.prototype.backupForm = function (form) {
        // create a JSON object as shown above but to store in local storage
        var jsonObject = DynamicForm.formObjectController.getJSONFromForm();

        jsonObject.isActivated = this.activateButton.find('input[type="checkbox"]').prop("checked");
        jsonObject.lastModified = $.now();
        var date = DynamicForm.toISODate(jsonObject.lastModified);

        // Store the form JSON object with specific community ID as a key
        if (DynamicForm.backupList[communityID] == undefined) {
            DynamicForm.backupList[communityID] = {};
        }
        if (DynamicForm.backupList[communityID][formID] != undefined) {
            DynamicForm.backupList[communityID] = {};
        }
        DynamicForm.backupList[communityID][formID] = jsonObject;
        localStorage["community-form-backup"] = JSON.stringify(DynamicForm.backupList);
    }
    // Method that enables warning when user leaving page without saving the form
    FormSaveController.prototype.enableSaveWarning = function () {
        if (!this.enabledWarning) {
            this.enabledWarning = true;
            $(window).on("beforeunload.save-warning", function () {
                return confirm("Are you sure you want to leave without saving?");
            });
            this.enableAutoSaving();
        }
    }
    // Method that disable warning when user saved the form in database
    FormSaveController.prototype.disableSaveWarning = function () {
        if (this.enabledWarning) {
            this.enabledWarning = false;
            $(window).off("beforeunload.save-warning");
            this.disableAutoSaving(); // also disable the auto-saving
        }
    }
    // Method that enables auto-saving to save form in the local storage with a 5000 miliseconds interval
    FormSaveController.prototype.enableAutoSaving = function () {
        const interval = 5000;

        this.autoSaving = window.setInterval(function () {
            DynamicForm.formSaveController.backupForm();
        }, interval)
    }
    // Method that disables auto-saving 
    FormSaveController.prototype.disableAutoSaving = function () {
        window.clearInterval(this.autoSaving);
    }
    FormSaveController.prototype.setRef = function (ref) {
        this.ref = ref;
    }
    this.formSaveController = new FormSaveController();

    // Form Edit Controller class
    // In charge of processing data from JSON object and display form editor on screen  
    var FormEditController = function () {
        this.formDataObject = {}; // object that stores all unprocessed data of a form
        this.fieldTypes = {};
        this.displayForm = $(".form-container");
        // list to convert field type name to field class name 
        this.fieldTypes = {
            text_label: "Label",
            text_box: "TextField",
            number_field: "NumberField",
            text_area: "TextAreaField",
            radio_button_group: "RadioButtonGroup",
            checkbox_group: "CheckboxGroup",
            drop_down_list: "DropDownList",
            toggle_button: "ToogleButton",
            date_time_picker: "DatetimePicker",
            file_upload: "FileUpload",
            first_name: "FirstName",
            last_name: "LastName",
            email: "Email",
            phone_number: "PhoneNumber"
        }
    }
    // Method to start processing data and display the form editor on screen
    FormEditController.prototype.loadFormFromDataObject = function () {
        this.displayForm.empty(); // clear the custom form editor
        var formJSONObject = this.formDataObject;

        // before loading the form, compare the lastModified time between the database record and backup record
        // if database record's lastModified time exceeds backup record's time, nothing happen
        // if backup record's lastModified time exceeds backup record's time, meaning that browser might crashed
        // then ask if the user would like to recover from the backup record
        try {
            if (DynamicForm.backupList[communityID][formID].lastModified > formJSONObject.lastModified) {
                var wantRecorver = window.confirm("We have detected there was a backup available from the last crash.\nWould you like to recover it?");

                if (wantRecorver) {
                    var formDataObject = DynamicForm.backupList[communityID][formID];

                    formDataObject.lastModified = formDataObject.lastModified;
                    this.setFormDataObject(formDataObject);
                    this.loadFormFromDataObject();
                    return;
                }
            }
        } catch (error) {

        }

        // extract data from the JSON object
        var memberType = formJSONObject.memberType;
        var form = new DynamicForm.Form(memberType); // new a form object
        var date = DynamicForm.toISODate(formJSONObject.lastModified);
        try {
            // update last modified time on screen
            DynamicForm.formSaveController.additionalInfo.find(".last-modified .modified-date").text(date);
        } catch (error) {

        }
        // activates the activate button when the form is activated
        DynamicForm.formSaveController.activateButton.find('input[type="checkbox"]').prop({
            checked: formJSONObject.isActivated
        });
        DynamicForm.formObjectController.setForm(form); // add form to the FormObjectController

        // loop through the field set of the form object and create the field object
        for (var fieldIndex = 0; fieldIndex < formJSONObject.fieldSet.length; fieldIndex++) {
            // extracts useful data from the JSON object
            var fieldJSONObject = formJSONObject.fieldSet[fieldIndex];
            var fieldType = fieldJSONObject.type;
            var fieldData = fieldJSONObject.data;
            var fieldLabel = fieldData.label;
            var field = new DynamicForm[this.fieldTypes[fieldType]](fieldLabel, fieldData); // new a field object
            // append the generated field UI element to the form element
            var fieldDOM = field.toFieldDOM().appendTo(form.dom);

            field.setDOM(fieldDOM); // bind the UI element back to the field object
            field.doSave(false);
            form.addField(field, false); // add the field to the form object
        }
    }
    FormEditController.prototype.setFormDataObject = function (formDataObject) {
        this.formDataObject = formDataObject;
    }
    this.formEditController = new FormEditController();

    // Form Display Controller
    // controller that is in charge of processing the data from the json object and display the form
    var FormDisplayController = function () {
        this.formDataObject = {}; // variable that stores the json object of the form
        this.fieldTypes = {};
        this.displayForm = $(".form-container");
        // List for the conversion between its type name and the class name
        this.fieldTypes = {
            text_label: "Label",
            text_box: "TextField",
            number_field: "NumberField",
            text_area: "TextAreaField",
            radio_button_group: "RadioButtonGroup",
            checkbox_group: "CheckboxGroup",
            drop_down_list: "DropDownList",
            toggle_button: "ToogleButton",
            date_time_picker: "DatetimePicker",
            file_upload: "FileUpload",
            first_name: "FirstName",
            last_name: "LastName",
            email: "Email",
            phone_number: "PhoneNumber"
        }
    }
    // display the form by the formDataObject
    FormDisplayController.prototype.loadFormFromDataObject = function () {
        // clear all UI elements inside the form-container element
        this.displayForm.empty();

        var formJSONObject = this.formDataObject;
        var memberType = formJSONObject.memberType;
        var form = new DynamicForm.Form(memberType); // create a new form by the member type
        var formDOM = form.toDisplayDOM(); // store a form UI elements to formDOM by the created form objecct
        this.displayForm.append(formDOM); // Display the form UI object on screen
        form.setDOM(formDOM) // blind the form UI element to the form object

        // loop through the json object that stores the fields of the form
        for (var fieldIndex = 0; fieldIndex < formJSONObject.fieldSet.length; fieldIndex++) {
            // extracts all values from the json object
            var fieldJSONObject = formJSONObject.fieldSet[fieldIndex];
            var fieldType = fieldJSONObject.type;
            var fieldData = fieldJSONObject.data;
            var fieldLabel = fieldData.label;
            var field = new DynamicForm[this.fieldTypes[fieldType]](fieldLabel, fieldData); // Create a field object by the field attributes and its label
            var fieldDOM = field.toDisplayDOM().appendTo(form.dom); // store a form UI element to fieldDOM by the created field object

            field.setDisplayDOM(fieldDOM); // set the field UI element for the field object
            field.setDOM(fieldDOM); // build the field UI element to the field object
            form.addField(field, false); // add the field object to the created form
        }
        DynamicForm.formObjectController.setForm(form); // add the created form to the global form set

        // Display the form submission and back button under the form
        var controlList = $('<tr class="control-list display-field">');
        var backButton = $('<td>').append('<button id="back-button">Back</button>');
        var submitForm = $('<td>').append('<button id="submit-form">Submit</button>');
        controlList.append(backButton).append(submitForm);
        formDOM.append(controlList);
    }
    FormDisplayController.prototype.validateFields = function () {
        var allPassedValidation = true;
        var form = DynamicForm.formObjectController.getForm();
        var fieldSet = form.fieldSet;

        for (var i = [] in fieldSet) {
            var field = fieldSet[i];
            var correctInput = field.doValidate();

            if (!correctInput) {
                allPassedValidation = false;
                field.doError();
            }
        }

        return allPassedValidation;
    }
    FormDisplayController.prototype.setFormDataObject = function (formDataObject) {
        this.formDataObject = formDataObject;
    }
    this.formDisplayController = new FormDisplayController();

    // Available Item Set class
    // Enables user to add field by UI drag and drop function
    var AvailableItemSet = function () {
        this.itemSet = []; // variable that stores all available fields
        this.itemList = $("#available-item-list");
        $(".back-button").on("click.back-to-list", function () {
            window.location.replace("form-list.html?communityID=" + communityID);
        });

        // Method to create a new available field with category
        this.addItem = function (item, category) {
            //If the specific category does not exist, create a new one on screen
            var targetCategory = $(".available-item-category .available-item-category-label[data-category='" + category + "']");

            if (targetCategory.length === 0) {
                targetCategory = $('<div class="available-item-category">').append($('<label class="available-item-category-label" data-category=\"' + category + '\">' + category + '</label>'));
                var innerList = $('<div class="available-item-list">');
                targetCategory.append(innerList);
                targetCategory = targetCategory.appendTo(this.itemList);
            }

            var index = this.itemSet.length;
            this.itemSet[index] = item;
            var fieldDOM = this.itemSet[index].toFieldDOM().attr({
                "data-id": index
            });
            // Connect the available field list with the form field list
            // Setting up the drag and drop function
            targetCategory.closest(".available-item-category").find(".available-item-list").append(fieldDOM)
                .sortable({
                    helper: "clone",
                    placeholder: "item-drop-position",
                    appendTo: "#available-item-list-container",
                    connectWith: ".form-container",
                    start: function (event, ui) {
                        ui.item.show();
                    },
                    stop: function (event, ui) {
                        $(this).sortable("cancel");
                    },
                    // when a field is dropped onto the form field list
                    // clone the desired field object from this list to that list
                    remove: function (event, ui) {
                        var id = ui.item.attr("data-id");
                        var field = DynamicForm.availableItemSet.getItemById(id);
                        var clonedField = $.extend(true, Object.create(Object.getPrototypeOf(DynamicForm.PanelContent)), field);
                        var clonedDOM = clonedField.toFieldDOM()
                            .insertAfter(ui.item);
                        clonedField.setDOM(clonedDOM);
                        DynamicForm.formObjectController.waitForProcessedField = clonedField;

                        return clonedDOM;
                    }
                });
        }

        this.getItemById = function (id) {
            return this.itemSet[id];
        }
    }
    AvailableItemSet.prototype.enableItemList = function () {
        if (!this.itemList.hasClass("enabled")) {
            this.itemList.addClass("enabled");
        }
    }
    AvailableItemSet.prototype.disableItemList = function () {
        if (this.itemList.hasClass("enabled")) {
            this.itemList.removeClass("enabled");
        }
    }
    this.availableItemSet = new AvailableItemSet();

    // Form Object Controller class
    // In charge of controlling the form object
    var FormObjectController = function () {
        this.editingForm = {}; // variable that sotres the form object
        this.formList = $("#form-container-list");
        this.currentForm;
        this.previousEditingField;
        this.waitForProcessedField;
        this.tabContainer = this.formList.tabs();
        this.tabContainer.find("#dynamic_form-tab-controls").sortable({
            axis: "x",
            containment: "#dynamic_form-tab-controls",
            items: ".ui-tabs-tab",
            stop: function () {
                DynamicForm.formObjectController.tabContainer.tabs("refresh");
            }
        });

        // Method to open a field's control panel
        this.enableFieldEdition = function (field, form) {
            try {
                this.previousEditingField.dom.removeClass("active");
            } catch (error) {

            }
            field.dom.addClass("active");
            DynamicForm.controlPanel.enablePanel(field, form);

            this.previousEditingField = field;
        }
    };
    // Method to set this controller a target form and display on screen
    FormObjectController.prototype.setForm = function (form) {
        var index = this.editingForm.length;
        this.editingForm = form;

        // Display the form on screen
        var generatedID = DynamicForm.generateID(10, "form-");
        var tabLabel = $('<li data-form_id="' + index + '"></li>');

        tabLabel.append('<a href="#' + generatedID + '">' + form.memberType + '</a>');
        this.formList.find("#dynamic_form-tab-controls").prepend(tabLabel);

        // create a form UI element
        var createdForm = $('<div class="form-container">').attr({
            id: generatedID,
            "data-form_id": index
        });
        this.formList.find("#dynamic_form-tab-controls").after(createdForm);
        // make the fields in the form sortable
        createdForm.sortable({
            tolerance: 'pointer',
            placeholder: "item-drop-position",
            start: function (event, ui) {
                $(this).sortable("refresh");

                var subSet = ui.item.find(".sub-set");
                if (subSet.length >= 1) {
                    var isEnabled = subSet.hasClass("enabled");

                    if (isEnabled) {
                        subSet.removeClass("enabled");
                    }
                }
            },
            // When the order of fields is changed, enable auto-saving with leaving warning
            sort: function (event, ui) {
                DynamicForm.formSaveController.enableSaveWarning();
            },
            // When an available field is dropped on this, add the field to this form object
            receive: function (event, ui) {
                var formID = $(this).attr("data-form_id");
                var form = DynamicForm.formObjectController.getForm();
                var field = DynamicForm.formObjectController.waitForProcessedField;
                form.addField(field);
            }
        });
        // bind the created form UI elements to the form object
        this.editingForm.setDOM(createdForm);
        this.refreshTabs();
    }
    // refresh the field list to ensure that its fields' position are correct
    FormObjectController.prototype.refreshTabs = function () {
        this.formList.tabs("refresh");
        this.formList.tabs("option", "active", 0);
    }
    FormObjectController.prototype.getForm = function () {
        return this.editingForm;
    }
    FormObjectController.prototype.getIdByForm = function (form) {
        return this.editingForm;
    }
    // Generate and return a JSON Object of the form object
    FormObjectController.prototype.getJSONFromForm = function () {
        var jsonObject = {};
        var form = this.editingForm;

        jsonObject = this.editingForm.toJSONObject();

        return jsonObject;
    }
    this.formObjectController = new FormObjectController();

    // Preview Form Controller class
    // In charge of performing preview function
    var PreviewFormController = function () {
        this.previewButton = $(".dynamic-form-button.form-preview-button");

        this.previewButton.on("click.preview-form", function () {
            DynamicForm.previewFormController.previewCurrentForm();
        });
    }
    // Method to preview this form
    PreviewFormController.prototype.previewCurrentForm = function () {
        var formID = DynamicForm.formObjectController.formList.tabs("instance").active.attr("data-form_id");

        if (formID != undefined) {
            this.previewFormByID(formID);
        }
    }
    // update the existing preview window
    PreviewFormController.prototype.updateCurrentPreview = function () {
        if (this.dom != undefined) {
            var formID = this.dom.attr("data-form_id");
        }

        if (formID != undefined) {
            this.previewFormByID(formID);
        }
    }
    // Method to display the form by the form object in a pop up window
    PreviewFormController.prototype.previewFormByID = function (id) {
        var form = DynamicForm.formObjectController.getForm(); // get the form from FormObjectController

        // when there is no pop up preview window, create a new one
        if (this.dom === undefined) {
            this.dom = $('<div class="preview-form-container">').dialog({
                width: "fit-content",
                autoOpen: false,
                resizable: false,
                appendTo: "#body-container",
                create: function (event, ui) {
                    var id = $(this).attr("id");
                    var container = $(this).closest('*[aria-describedby="' + id + '"]');
                    var closeButton = container.find(".ui-dialog-titlebar-close");
                    closeButton.append('<i class="material-icons">close</i>');
                }
            });
            this.dom.attr({
                "data-form_id": id
            });
        }
        // by using form.toDisplayDOM()
        // generate the form UI element with its fields, then display on screen with pop up window
        this.dom = this.dom.empty().append(form.toDisplayDOM());
        this.dom.dialog("open");
    }
    this.previewFormController = new PreviewFormController();

    // Control Panel class
    // In charge of displaying control panel and controlling the save data behavior of control panel
    var ControlPanel = function () {
        this.panel = $("#item-manage-control");
        this.isEnabled = false; // specify if the panel is enabled
        this.locked = false; // specify if the panel is locked

        // enables the panel with a panel content object
        this.enablePanel = function (panelContent, form) {
            // if the panel is locked, not do any thing
            if (this.locked) {
                return;
            }
            // enable the control panel and instantly focus on the panel
            if (!this.isEnabled) {
                this.locked = true;
                this.panel.addClass("enabled").one("transitionend", function () {
                    DynamicForm.controlPanel.panel.find("input[type='text']").focus();
                    DynamicForm.controlPanel.locked = false;
                });

                this.isEnabled = true;
            } else {
                this.clearPanelContent();
            }

            // build content of the panel with a panel content object
            this.buildPanelContent(panelContent, form);
        }
        // disable the panel and clear its content
        this.disablePanel = function () {
            if (this.locked) {
                return;
            }
            if (this.isEnabled) {
                this.locked = true;
                this.panel.removeClass("enabled").one("transitionend", function () {
                    DynamicForm.controlPanel.locked = false;
                });
                this.clearPanelContent();

                this.isEnabled = false;
            }
        }
        // Method to build panel content by using a panel content object
        this.buildPanelContent = function (panelContent, form) {
            var content = panelContent.toPanelDOM(); // use toPanelDOM method to generate panel content
            var formID = DynamicForm.formObjectController.getIdByForm(form);
            var fieldID = -1;
            try {
                fieldID = form.getIdByField(panelContent);
            } catch (error) {

            }
            content.attr({
                "data-form_id": formID,
                "data-field_id": fieldID
            })

            // Add the generated content to the UI element of the control panel
            this.panel.append(content);
        }
        // Method to clear all panel content
        this.clearPanelContent = function (panelContent) {
            this.panel.empty();
        }
    }
    this.controlPanel = new ControlPanel()

    // abstract class Panel Content
    // Object that is used to generate standardized panel content
    // In charge of storing info obtained from user's input in the control panel
    // including text, header, field group and etc.
    this.PanelContent = function (data) {
        this.setData.call(this, data);
    }
    // Set the data object and call the doSave method
    this.PanelContent.prototype.setData = function (data) {
        this.data = data; // variable that stores user's input values
        try {
            this.doSave();
        } catch (error) {

        }
    }
    // Method that will be executed when the data object is being saved
    this.PanelContent.prototype.doSave = function () {

    }
    // Generate UI element
    this.PanelContent.prototype.toPanelDOM = function () {
        var dom = $('<div class="tab-control">');

        return dom;
    }
    // Method to create standardized header UI element
    this.PanelContent.prototype.createHeader = function (header) {
        var dom = $('<div class="type-header">' + header + '</div>');

        return dom;
    }
    // Method to create standardized text UI element
    this.PanelContent.prototype.createText = function (name, label, value, isInline) {
        var dom = $('<div class="field-control ' + name + ' ' + ((isInline == true) ? "inline-field" : "") + '">');
        dom.append('<label class="field-text">' + label + '</label>');
        dom.append($('<input class="field-input form-control" type="text" >').val(((value != undefined) ? value : "")));

        return dom;
    }
    // Method to create standardized textarea UI element
    this.PanelContent.prototype.createTextarea = function (name, label, value, isInline, rows, cols) {
        var dom = $('<div class="field-control ' + name + ' ' + ((isInline == true) ? "inline-field" : "") + '">');
        dom.append('<label class="field-text">' + label + '</label>');
        dom.append($('<textarea class="field-input form-control" rows="' + rows + '" cols="' + cols + '" >').val(((value != undefined) ? value : "")));

        return dom;
    }
    // Method to create standardized number field UI element
    this.PanelContent.prototype.createNumber = function (name, label, value, isInline, min, max) {
        var dom = $('<div class="field-control ' + name + ' ' + ((isInline == true) ? "inline-field" : "") + '">');
        dom.append('<label class="field-text">' + label + '</label>');
        dom.append('<input class="field-input form-control" type="number" ' + ((min != undefined) ? 'min="' + min + '"' : "") + ' ' + ((max != undefined) ? 'max="' + max + '"' : "") + ' value=' + ((value != undefined) ? value : "") + ' >');

        return dom;
    }
    // Method to create standardized a wrapped set of UI element
    this.PanelContent.prototype.createSet = function (label, isSlided, content) {
        var dom = $('<div class="field-control-set">');
        var generatedID = DynamicForm.generateID(10, "set-");
        dom.append('<label for="' + generatedID + '">' + label + '</label>');
        dom.append('<input id="' + generatedID + '" type="checkbox" ' + ((isSlided == true) ? "checked" : "") + '>');
        var setContent = $('<div class="field-control-set-content">');
        setContent.append(content);
        dom.append(setContent);

        return dom;
    }
    // Method to create standardized dropdown list UI element
    this.PanelContent.prototype.createDropdown = function (name, label, options, selected) {
        var dom = $('<div class="field-control ' + name + '">');
        dom.append('<label class="field-text">' + label + '</label>');
        var select = $('<select class="field-input form-control">');
        for (var i = 0; i < options.length; i++) {
            select.append('<option value="' + i + '">' + options[i] + '</option>');
        }
        select.find('option[value="' + selected + '"]').prop("selected", true);
        dom.append(select);

        return dom;
    }
    // Method to create standardized switch / toggle UI element
    this.PanelContent.prototype.createSwitch = function (name, label, isChecked) {
        var dom = $('<div class="field-control ' + name + '">');
        dom.append('<label class="field-text">' + label + '</label>');
        var switchField = $('<label class="switch">');
        var switchButton = $('<input class="field-input switch" type="checkbox">').prop({
            checked: isChecked
        }).val(isChecked);
        switchField.on("change.change-switch-status", {
            switchButton: switchButton
        }, function (event) {
            var switchButton = event.data.switchButton;
            var isChecked = switchButton.prop("checked");

            if (isChecked) {
                switchButton.val(true);
            } else {
                switchButton.val(false);
            }
        });
        switchField.append(switchButton);
        switchField.append('<span class="slider round"></span>');
        dom.append(switchField);

        return dom;
    }
    // Method to create standardized option creator UI element
    // for fields that may include multiple options, e.g. Radio, Checkbox and dropdown
    this.PanelContent.prototype.createOptionCreator = function (name, label, values, isHalf) {
        var dom = $('<div class="field-control ' + name + '">');
        dom.append('<label class="field-text">' + label + '</label>');
        var optionList = $('<div class="field-option-list">');
        var input = $('<input class="field-input form-control remove-option-button half-field ' + ((isHalf == true) ? "inline-field" : "") + '" type="text" >');
        var optionItem = $('<div class="option-item">').append(input);

        for (var i = 0; i < values.length; i++) {
            var removeOptionButton = $('<i class="material-icons remove-option-button">close</i>');
            var option = optionItem.clone();

            option.find("input").val(((values[i] != undefined) ? values[i] : ""));
            removeOptionButton.on("click.remove-otpion", function (event) {
                var beforeOption = $(this).prev();

                $(this).add(beforeOption).remove();
            });

            if (i >= 1) {
                option.append(removeOptionButton);
            }

            optionList.append(option);
        }
        try {
            var firstOption = $(optionList.find(".field-input")[0]);
            firstOption.addClass("inline-field");

            var addOptionButton = $('<i class="material-icons add-option-button">add_circle</i>');
            var allOptionsExceptFirst = optionList.find("input").not(firstOption);

            addOptionButton.on("click.add-otpion", {
                optionList: optionList,
                isHalf: isHalf,
                optionItem: optionItem.clone()
            }, function (event) {
                var optionList = event.data.optionList;
                var removeOptionButton = $('<i class="material-icons remove-option-button">close</i>');
                var isHalf = event.data.isHalf;
                var optionItem = event.data.optionItem;

                removeOptionButton.on("click.remove-otpion", function (event) {
                    var beforeOption = $(this).prev();

                    $(this).add(beforeOption).remove();
                });

                var option = optionItem.clone()
                    .append(removeOptionButton);
                var input = option.find("input");

                optionList.append(option);
                input.focus();
            });

            firstOption.after(addOptionButton);
        } catch (error) {

        }

        dom.append(optionList);

        return dom;
    }
    // Method to create standardized date picker UI element
    this.PanelContent.prototype.createDatetimePicker = function (name, label, value, isInline) {
        var dom = $('<div class="field-control ' + name + ' ' + ((isInline == true) ? "inline-field" : "") + '">');
        dom.append('<label class="field-text">' + label + '</label>');
        var datepicker = $('<input class="field-input form-control" type="text" >').val(((value != undefined) ? value : ""));
        datepicker.datepicker({
            dateFormat: "dd-mm-yy",
        });
        dom.append(datepicker);

        return dom;
    }

    // Form class  
    // Object that stores the relevant data of a form, such as form name and field set
    this.Form = function (memberType, data) {
        DynamicForm.PanelContent.call(this, data);

        this.displayDOM; // variable that stores the created UI element of this form
        this.memberType = memberType; // name of form
        this.fieldSet = []; // set of field

        // Add a field object to the field set
        this.addField = function (field, enabledWarning) {
            var index = this.fieldSet.length;
            // link the field with this form
            this.fieldSet[index] = field;
            this.fieldSet[index].setForm(this);
            this.fieldSet[index].dom.attr({
                "data-id": index
            });
            // enables edition and deletion of the field
            this.fieldSet[index].dom.find(".form-edit-control.edit").on("click.form-edit", {
                form: this,
                field: field
            }, function (event) {
                var form = event.data.form;
                var field = event.data.field;

                DynamicForm.formObjectController.enableFieldEdition(field, form);
            });
            this.fieldSet[index].dom.find(".form-edit-control.delete").on("click.form-delete", {
                form: this,
                field: field
            }, function (event) {
                var form = event.data.form;
                var field = event.data.field;

                form.removeField(field);
            });

            // enable auto-saving function when user manually adds fields
            if (enabledWarning === false) {
                DynamicForm.formSaveController.disableSaveWarning();
            } else {
                DynamicForm.formSaveController.enableSaveWarning();
            }
        }
        this.removeField = function (field) {
            var index = this.fieldSet.indexOf(field);
            this.removeFieldById(index);
            // enable auto-saving function when user manually remove fields
            DynamicForm.formSaveController.enableSaveWarning();
        }
        this.removeFieldById = function (id) {
            this.fieldSet[id].dom.remove();
            delete this.fieldSet[id];
            // enable auto-saving function when user manually remove fields
            DynamicForm.formSaveController.enableSaveWarning();
        }
        this.setMemberType = function (memberType) {
            this.memberType = memberType;
        }
    }
    this.Form.prototype = Object.create(this.PanelContent.prototype);
    this.Form.constructor = this.Form;
    this.Form.prototype.getFieldById = function (id) {
        return this.fieldSet[id];
    }
    this.Form.prototype.getFieldById = function (id) {
        return this.fieldSet[id];
    }
    this.Form.prototype.getIdByField = function (field) {
        return this.fieldSet.indexOf(field);
    }
    // Method to bind a form UI element to this object
    this.Form.prototype.setDisplayDOM = function (displayDOM) {
        this.displayDOM = displayDOM;
    }
    // Method to get an array of values from user's input
    // Used in form display to collect data from all field displayed on screen
    this.Form.prototype.getFormValues = function () {
        var valueObject = [];

        for (var i = 0; i < this.fieldSet.length; i++) {
            var field = this.fieldSet[i];

            valueObject[i] = field.getFieldValue();
        }

        return valueObject;
    }
    // Generate and return a form UI element with its field
    this.Form.prototype.toDisplayDOM = function () {
        var dom = $('<div class="custom-form-container">');
        // Generate the field UI elements according to their order in this form
        var orderedFieldList = [];
        var fields = $(this.dom).find(".field-item-container");
        for (var i = 0; i < fields.length; i++) {
            var id = $(fields[i]).attr("data-id");
            var field = this.getFieldById(id);

            orderedFieldList[i] = field;
        }

        for (var i = 0; i < orderedFieldList.length; i++) {
            dom.append(orderedFieldList[i].toDisplayDOM());
        }

        // Append a header with the form name
        var headline = $('<tr class="display-field display-field-combined" data-type="member_type" colspan="2">');
        headline.text(this.memberType);
        dom.prepend(headline);

        return dom;
    }
    this.Form.prototype.setDisplayDOM = function (displayDOM) {
        this.displayDOM = displayDOM;
    }
    // Method to generate JSON Object with all data
    this.Form.prototype.toJSONObject = function () {
        var jsonObject = {
            memberType: this.memberType,
            fieldSet: []
        };
        // Create a field set storing the JSON object generated by the field objects in order
        var orderedFieldList = [];
        var fields = $(this.dom).find(".field-item-container");
        for (var i = 0; i < fields.length; i++) {
            var id = $(fields[i]).attr("data-id");
            var field = this.getFieldById(id);

            orderedFieldList[i] = field;
        }

        for (var i = 0; i < orderedFieldList.length; i++) {
            var field = orderedFieldList[i];
            var index = jsonObject.fieldSet.length;
            if (field === undefined) {
                continue;
            }

            jsonObject.fieldSet[index] = field.toJSONObject();
        }

        return jsonObject;
    }
    this.Form.prototype.setDOM = function (dom) {
        this.dom = dom;
    }

    // abstract class Field extends PanelContent
    // class that identifies a field and stores its core data
    this.Field = function (icon, typeLabel, type, data) {
        DynamicForm.PanelContent.call(this, data);
        this.icon = icon; // Icon for easier recognization
        this.typeLabel = typeLabel; // Type Label that will be displayed never be changed
        this.type = type; // name of type that will be used as identity
    };
    this.Field.prototype = Object.create(this.PanelContent.prototype);
    this.Field.constructor = this.Field;
    this.Field.prototype.setForm = function (form) {
        this.form = form;
    }
    this.Field.prototype.setDisplayDOM = function (displayDOM) {
        this.displayDOM = displayDOM;
    }
    // Method to change the field type for predefined field extension, e.g. Email, Name, Phone Number and etc.
    this.Field.prototype.setType = function (type) {
        this.type = type;
    }
    // Method to generate a UI component to be displayed on scrren in the custom form editor
    this.Field.prototype.toFieldDOM = function () {
        // Note: 
        // material-icons is Google library that displays icon by its content text
        var dom = $('<div class="field-item-container">');
        var fieldItem = $('<div class="field-item ' + this.type + '" data-type="' + this.typeLabel + '">');
        fieldItem.append('<i class="form-logo material-icons">' + this.icon + '</i>');
        fieldItem.append('<label class="form-label">' + this.data.label + '</label>');
        fieldItem.append('<i class="form-required" data-required="' + this.data.isRequired + '">*</i>');
        fieldItem.append('<i class="form-edit-control material-icons delete">delete</i>');
        fieldItem.append('<i class="form-edit-control material-icons edit">edit</i>');
        dom.append(fieldItem);

        return dom;
    }
    // Method to generate and return a UI component to be displayed on scrren in the custom form editor
    // All UI elements here will be the standardized fields provided in parent class, Panel Content
    this.Field.prototype.toPanelDOM = function () {
        // Calling super.toPanelDOM() from parent class
        var dom = Object.getPrototypeOf(DynamicForm.Field.prototype).toPanelDOM.call(this);
        // When click on the save button on the control panel, trigger data storing operation
        var saveButton = $('<input type="button" class="control-save" value="Save">');
        saveButton.on("click.save-data", function (event) {
            var formID = DynamicForm.controlPanel.panel.find(".tab-control").attr("data-form_id");
            var form = DynamicForm.formObjectController.getForm();
            var fieldID = DynamicForm.controlPanel.panel.find(".tab-control").attr("data-field_id");
            var field = form.getFieldById(fieldID);
            var optionList = DynamicForm.controlPanel.panel.find(".field-option-list input");
            var allInputs = DynamicForm.controlPanel.panel.find(".field-control").find("input, select, textarea").not(optionList);
            var data = {};

            if (optionList.length >= 1) {
                var name = optionList.closest(".field-control")[0].classList[1];
                data[name] = [];
                for (var i = 0; i < optionList.length; i++) {
                    data[name][i] = $(optionList[i]).val();
                }
            }

            // Save the input values from the control panel to data object
            for (var i = 0; i < allInputs.length; i++) {
                var name = allInputs[i].closest(".field-control").classList[1];
                var switches = $(allInputs[i]).filter('.switch[type="checkbox"]')
                var checkbox = $(allInputs[i]).filter('[type="checkbox"]');
                var selecteList = $(allInputs[i]).filter('[type="checkbox"]');


                if (switches.length >= 1) {
                    var isChecked = ((switches.val() == "false") ? false : true);
                    data[name] = isChecked;
                    continue;
                } else if (checkbox.length >= 1) {
                    data[name] = checkbox.filter(":checked").val();
                    continue;
                }
                if (selecteList.length >= 1) {
                    data[name] = selecteList.filter(":selected").val();
                    continue;
                }

                data[name] = $(allInputs[i]).val();
            }

            field.setData(data);
        });
        dom.append(saveButton);
        dom.append(this.createHeader(this.typeLabel));

        return dom;
    }
    // return validation result when validating the field value in case of form display
    this.Field.prototype.doValidate = function (value) {
        const passedValidation = true;

        this.displayDOM.removeClass("error");

        return passedValidation;
    }
    // Method supposed to be executed when validation returns error in case of form display
    this.Field.prototype.doError = function (value) {
        this.displayDOM.addClass("error");

        return;
    }
    // Get its field value from the UI element
    this.Field.prototype.getFieldValue = function () {
        var value = this.displayDOM.find("input, select, textarea").val();

        return value;
    }
    // Calculate the field size with a maximum length of input
    this.Field.prototype.getFieldSize = function (length) {
        length = parseInt(length);
        var fontSize = parseFloat($("body").css("font-size"));
        var size = fontSize * length;

        if (size < fontSize * 4) {
            size = fontSize * 4;
        }

        return size;
    }
    // Generate the UI element on screen in case of form display
    this.Field.prototype.toDisplayDOM = function () {
        var field = $('<tr class="display-field" data-type="' + this.type + '">');

        return field;
    }
    // Method to generate and return the JSON object with its stored data
    this.Field.prototype.toJSONObject = function () {
        var jsonObject = {};
        jsonObject.type = this.type;
        jsonObject.data = this.data;

        return jsonObject;
    }
    // Method to be executed when user saved the values from the panel content of this object
    this.Field.prototype.doSave = function (enabledWarning) {
        Object.getPrototypeOf(DynamicForm.Field.prototype).doSave.call(this);
        var formField = this.dom.find(".field-item");
        formField.find(".form-label").text(this.data.label);
        formField.find(".form-required").attr({
            "data-required": this.data.isRequired
        });

        // When saved the field's panel content manually, trigger the auto-saving function 
        if (enabledWarning === false) {
            DynamicForm.formSaveController.disableSaveWarning();
        } else {
            DynamicForm.formSaveController.enableSaveWarning();
        }
    }
    this.Field.prototype.setDOM = function (dom) {
        this.dom = dom;
    }
    this.Field.prototype.setICON = function (icon) {
        this.icon = icon;
    }

    // class Label extends Field
    this.Label = function (typeLabel, data) {
        // calling super class constructor
        DynamicForm.Field.call(this, "description", typeLabel, "text_label", data);
    }
    this.Label.prototype = Object.create(this.Field.prototype);
    this.Label.constructor = this.Label;
    this.Label.prototype.toFieldDOM = function () {
        var dom = Object.getPrototypeOf(DynamicForm.Label.prototype).toFieldDOM.call(this);

        return dom;
    }
    this.Label.prototype.toPanelDOM = function () {
        var dom = Object.getPrototypeOf(DynamicForm.Label.prototype).toPanelDOM.call(this);

        dom.append(this.createText("label", "Label", this.data.label));
        var description = this.createTextarea("description", "Description", this.data.description, false, 10, 100);

        dom.append(description);

        return dom;
    }
    this.Label.prototype.toDisplayDOM = function () {
        var field = Object.getPrototypeOf(DynamicForm.Label.prototype).toDisplayDOM.call(this);
        var td = $('<td class="display-field-combined" colspan="2">');
        var label = $('<pre class="hide-input"></pre>');

        label.text(((this.data.description != undefined) ? this.data.description : ""));
        td.append(label);
        field.append(td);

        return field;
    }

    // class Text Field extends Field
    this.TextField = function (typeLabel, data) {
        // calling super class constructor
        DynamicForm.Field.call(this, "text_format", typeLabel, "text_box", data);

        // Data Type conversion from index to regex
        this.regexList = {
            1: '^[\\w\s ]*$',
            2: '^[0-9]*$'
        };
    }
    this.TextField.prototype = Object.create(this.Field.prototype);
    this.TextField.constructor = this.TextField;
    this.TextField.prototype.toFieldDOM = function () {
        // calling super method
        var dom = Object.getPrototypeOf(DynamicForm.TextField.prototype).toFieldDOM.call(this);

        return dom;
    }
    this.TextField.prototype.toPanelDOM = function () {
        // calling super method
        var dom = Object.getPrototypeOf(DynamicForm.TextField.prototype).toPanelDOM.call(this);

        dom.append(this.createText("label", "Label", this.data.label));
        dom.append(this.createSwitch("isRequired", "Required Field", this.data.isRequired));
        var options = this.createDropdown("data-type", 'Data Type', ["All", "Text", "Number"], this.data["data-type"]);
        var minLength = this.createNumber("min-length", "Min Length", this.data["min-length"], false, 0);
        var maxLength = this.createNumber("max-length", "Max Size", this.data["max-length"], false, 0);
        var placeholder = this.createText("placeholder", "Placeholder", this.data.placeholder);
        var regex = this.createText("regex", "Regular Expression", this.data.regex);
        var setContent_1 = this.createSet('<i class="material-icons">add_circle_outline</i>Advanced', false, regex);
        var setContent_2 = this.createSet('<i class="material-icons">arrow_drop_down</i>Restriction', true, options.add(minLength).add(maxLength).add(placeholder).add(setContent_1));

        dom.append(setContent_2);

        return dom;
    }
    this.TextField.prototype.toDisplayDOM = function () {
        // calling super method
        var field = Object.getPrototypeOf(DynamicForm.TextField.prototype).toDisplayDOM.call(this);
        var label = $('<td class="display-field-label">' + this.data.label + '</td>').attr({
            "data-isRequired": this.data.isRequired
        });
        var input = $('<input type="text" class="field-input form-control"></td>');
        input.attr({
            minlength: this.data["min-length"],
            maxlength: this.data["max-length"],
            placeholder: ((this.data.placeholder != undefined) ? this.data.placeholder : "")
        }).css({
            width: this.getFieldSize(this.data["max-length"]) + "px"
        }).val(((this.data.value != undefined) ? this.data.value : ""));
        input = $('<td class="display-field-input input-sm" >').append(input);

        field.append(label.add(input));

        return field;
    }
    this.TextField.prototype.doValidate = function () {
        // calling super method
        var passedValidation = Object.getPrototypeOf(DynamicForm.TextField.prototype).doValidate.call(this);
        var value = this.getFieldValue();

        try {
            // Required Field
            if (this.data.isRequired) {
                if (value === "") {
                    passedValidation = false;
                }
            }
            // Min Length
            if (!(value.length >= this.data["min-length"])) {
                passedValidation = false;
            }
            // Max Length
            if (!(value.length <= this.data["max-length"])) {
                passedValidation = false;
            }

            // Data Type
            var dataTypeIndex = this.data["data-type"];
            var dataTypeRegex = new RegExp(this.regexList[dataTypeIndex]);
            if (!dataTypeRegex.test(value)) {
                passedValidation = false;
            }

            // Custom Regular Expression
            var customRegex = new RegExp(this.data.regex); // convert the regex string to a regular expression object
            if (!customRegex.test(value)) { // validate the value
                passedValidation = false;
            }
        } catch (error) {
            console.log(error)
        }

        return passedValidation;
    }

    // class Number Field extends Field
    this.NumberField = function (typeLabel, data) {
        // calling super class constructor
        DynamicForm.Field.call(this, "looks_one", typeLabel, "number_field", data);
    }
    this.NumberField.prototype = Object.create(this.Field.prototype);
    this.NumberField.constructor = this.NumberField;
    this.NumberField.prototype.toFieldDOM = function () {
        // calling super method
        var dom = Object.getPrototypeOf(DynamicForm.NumberField.prototype).toFieldDOM.call(this);

        return dom;
    }
    this.NumberField.prototype.toPanelDOM = function () {
        // calling super method
        var dom = Object.getPrototypeOf(DynamicForm.NumberField.prototype).toPanelDOM.call(this);

        dom.append(this.createText("label", "Label", this.data.label));
        dom.append(this.createSwitch("isRequired", "Required Field", this.data.isRequired));
        var min = this.createNumber("min", "Minimum", this.data.min, true, 0);
        var max = this.createNumber("max", "Maximum", this.data.max, true, 0);
        var placeholder = this.createText("placeholder", "Placeholder", this.data.placeholder);
        var setContent_1 = this.createSet('<i class="material-icons">arrow_drop_down</i>Restriction', true, min.add(max).add(placeholder));

        dom.append(setContent_1);

        return dom;
    }
    this.NumberField.prototype.toDisplayDOM = function () {
        // calling super method
        var field = Object.getPrototypeOf(DynamicForm.NumberField.prototype).toDisplayDOM.call(this);
        var label = $('<td class="display-field-label">' + this.data.label + '</td>').attr({
            "data-isRequired": this.data.isRequired
        });;
        var input = $('<input type="number" class="field-input form-control"></td>');
        input.attr({
            min: this.data.min,
            max: this.data.max,
            placeholder: ((this.data.placeholder != undefined) ? this.data.placeholder : "")
        }).css({
            width: this.getFieldSize(this.data.max.length + 1) + "px"
        }).val(((this.data.value != undefined) ? this.data.value : ""));
        input = $('<td class="display-field-input input-sm" >').append(input);

        field.append(label.add(input));

        return field;
    }
    this.NumberField.prototype.doValidate = function () {
        // calling super method
        var passedValidation = Object.getPrototypeOf(DynamicForm.NumberField.prototype).doValidate.call(this);
        var value = this.getFieldValue();

        try {
            // Required Field
            if (this.data.isRequired) {
                if (value === "") {
                    passedValidation = false;
                }
            }
            // Min Length
            if (!(value >= this.data["min-length"])) {
                passedValidation = false;
            }
            // Max Length
            if (!(value <= this.data["max-length"])) {
                passedValidation = false;
            }
        } catch (error) {
            console.log(error)
        }

        return passedValidation;
    }

    // class TextAreaField extends Field
    this.TextAreaField = function (typeLabel, data) {
        // calling super class constructor
        DynamicForm.Field.call(this, "text_fields", typeLabel, "text_area", data);

        this.colTextAomunt = 50;
    }
    this.TextAreaField.prototype = Object.create(this.Field.prototype);
    this.TextAreaField.constructor = this.TextAreaField;
    this.TextAreaField.prototype.toFieldDOM = function () {
        // calling super class constructor
        var dom = Object.getPrototypeOf(DynamicForm.TextAreaField.prototype).toFieldDOM.call(this);

        return dom;
    }
    this.TextAreaField.prototype.toPanelDOM = function () {
        // calling super method
        var dom = Object.getPrototypeOf(DynamicForm.TextAreaField.prototype).toPanelDOM.call(this);

        dom.append(this.createText("label", "Label", this.data.label));
        dom.append(this.createSwitch("isRequired", "Required Field", this.data.isRequired));
        var minLength = this.createNumber("min-length", "Min Length", this.data["min-length"], false, 0);
        var maxLength = this.createNumber("max-length", "Max Size", this.data["max-length"], false, 0);
        var placeholder = this.createText("placeholder", "Placeholder", this.data.placeholder);
        var setContent_2 = this.createSet('<i class="material-icons">arrow_drop_down</i>Restriction', true, minLength.add(maxLength).add(placeholder));

        dom.append(setContent_2);

        return dom;
    }
    this.TextAreaField.prototype.toDisplayDOM = function () {
        // calling super method
        var field = Object.getPrototypeOf(DynamicForm.TextAreaField.prototype).toDisplayDOM.call(this);
        field.append('<label class="display-field-label">' + this.data.label + '</label>').attr({
            "data-isRequired": this.data.isRequired
        });;
        field.append('<input type="text" value="' + ((this.data.value != undefined) ? this.data.value : "") + '" placeholder="' + ((this.data.placeholder != undefined) ? this.data.placeholder : "") + '" >');

        return field;
    }
    this.TextAreaField.prototype.toDisplayDOM = function () {
        // calling super method
        var field = Object.getPrototypeOf(DynamicForm.TextAreaField.prototype).toDisplayDOM.call(this);
        var label = $('<td class="display-field-label">' + this.data.label + '</td>').attr({
            "data-isRequired": this.data.isRequired
        });
        var textReminder = $('<span>You have <span class="char-left"></span> characters left.</span>');

        textReminder.find(".char-left").text(this.data["max-length"]);

        var input = $('<textarea class="field-input form-control">').attr({
            cols: this.colTextAomunt,
            rows: parseInt(this.data["max-length"]) / this.colTextAomunt
        });
        input.attr({
                minlength: this.data["min-length"],
                maxlength: this.data["max-length"],
                placeholder: ((this.data.placeholder != undefined) ? this.data.placeholder : "")
            }).val(((this.data.value != undefined) ? this.data.value : ""))
            .on("input", {
                textReminder: textReminder,
                maxLength: this.data["max-length"]
            }, function (event) {
                var textReminder = event.data.textReminder;
                var maxLength = event.data.maxLength;
                var length = $(this).val().length;

                textReminder.find(".char-left").text(maxLength - length);
            });
        input = $('<td class="display-field-input input-sm block" >').append(input.add(textReminder));

        field.append(label.add(input));

        return field;
    }
    this.TextAreaField.prototype.doValidate = function () {
        // calling super method
        var passedValidation = Object.getPrototypeOf(DynamicForm.TextAreaField.prototype).doValidate.call(this);
        var value = this.getFieldValue();

        try {
            // Required Field
            if (this.data.isRequired) {
                if (value === "") {
                    passedValidation = false;
                }
            }
            // Min Length
            if (!(value.length >= this.data["min-length"])) {
                passedValidation = false;
            }
            // Max Length
            if (!(value.length <= this.data["max-length"])) {
                passedValidation = false;
            }
        } catch (error) {
            console.log(error)
        }

        return passedValidation;
    }

    // class RadioButtonGroup
    this.RadioButtonGroup = function (typeLabel, data) {
        // calling super class constructor
        DynamicForm.Field.call(this, "radio_button_checked", typeLabel, "radio_button_group", data);
    }
    this.RadioButtonGroup.prototype = Object.create(this.Field.prototype);
    this.RadioButtonGroup.constructor = this.RadioButtonGroup;
    this.RadioButtonGroup.prototype.toFieldDOM = function () {
        // calling parent method
        var dom = Object.getPrototypeOf(DynamicForm.RadioButtonGroup.prototype).toFieldDOM.call(this);
        dom.append('<div class="sub-set option-list">');

        return dom;
    }
    this.RadioButtonGroup.prototype.toPanelDOM = function () {
        // calling parent method
        var dom = Object.getPrototypeOf(DynamicForm.RadioButtonGroup.prototype).toPanelDOM.call(this);

        dom.append(this.createText("label", "Label", this.data.label));
        dom.append(this.createSwitch("isRequired", "Required Field", this.data.isRequired));
        var optionList = this.createOptionCreator("option-list", 'Options', this.data["option-list"], true);

        dom.append(optionList);

        return dom;
    }
    this.RadioButtonGroup.prototype.toDisplayDOM = function () {
        // calling parent method
        var field = Object.getPrototypeOf(DynamicForm.RadioButtonGroup.prototype).toDisplayDOM.call(this);
        var label = $('<td class="display-field-label block">' + this.data.label + '</td>').attr({
            "data-isRequired": this.data.isRequired
        });;
        var optionList = $('<td class="display-field-input input-sm block" >');
        var name = DynamicForm.generateName(10);

        for (var i = 0; i < this.data["option-list"].length; i++) {
            var option = $('<div class="input-option">');
            var input = $('<input type="radio" >').attr({
                name: name
            });
            option.append(input);
            option.append('<span class="option-label">' + this.data["option-list"][i] + '</span>');

            optionList.append(option);
        }
        field.append(label.add(optionList));

        return field;
    }
    this.RadioButtonGroup.prototype.doSave = function () {
        // calling parent method
        Object.getPrototypeOf(DynamicForm.RadioButtonGroup.prototype).doSave.call(this);
        var dom = this.dom;
        var optionListDOM = dom.find('.option-list');

        optionListDOM.empty();
        for (var i = 0; i < this.data["option-list"].length; i++) {
            var option = $('<div class="sub-item">');
            var optionData = this.data["option-list"][i];
            var optionLabel = $('<label class="option-label">').text(optionData);

            option.append(optionLabel);
            optionListDOM.append(option);
        }

        var formField = dom.find(".field-item");
        var subSet = dom.find(".sub-set");
        if (subSet.length >= 1) {
            var subItem = subSet.children();
            var subSign = formField.find(".sub-sign");

            if (subItem.length >= 1) {

                if (subSign.length === 0) {
                    subSign = $('<i class="material-icons sub-sign">keyboard_arrow_down</i>');
                    formField.prepend(subSign);
                }

                formField.off("click.enable-viewing-sub-set");
                formField.on("click.enable-viewing-sub-set", {
                    subSet: subSet
                }, function (event) {
                    var subSet = event.data.subSet;
                    var isEnabled = subSet.hasClass("enabled");

                    if (isEnabled) {
                        subSet.removeClass("enabled");
                    } else {
                        subSet.addClass("enabled");
                    }
                });
            } else {
                subSign.remove();
            }
        }
    }

    // class Checkbox Group extends Field
    this.CheckboxGroup = function (typeLabel, data) {
        // calling parent class constructor
        DynamicForm.Field.call(this, "check_box", typeLabel, "checkbox_group", data);
    }
    this.CheckboxGroup.prototype = Object.create(this.Field.prototype);
    this.CheckboxGroup.constructor = this.CheckboxGroup;
    this.CheckboxGroup.prototype.toFieldDOM = function () {
        // calling parent method
        var dom = Object.getPrototypeOf(DynamicForm.CheckboxGroup.prototype).toFieldDOM.call(this);
        dom.append('<div class="sub-set option-list">');

        return dom;
    }
    this.CheckboxGroup.prototype.toPanelDOM = function () {
        // calling parent method
        var dom = Object.getPrototypeOf(DynamicForm.CheckboxGroup.prototype).toPanelDOM.call(this);

        dom.append(this.createText("label", "Label", this.data.label));
        dom.append(this.createSwitch("isRequired", "Required Field", this.data.isRequired));
        var optionList = this.createOptionCreator("option-list", 'Options', this.data["option-list"], true);

        dom.append(optionList);

        return dom;
    }
    this.CheckboxGroup.prototype.toDisplayDOM = function () {
        // calling parent method
        var field = Object.getPrototypeOf(DynamicForm.CheckboxGroup.prototype).toDisplayDOM.call(this);
        var label = $('<td class="display-field-label block">' + this.data.label + '</td>').attr({
            "data-isRequired": this.data.isRequired
        });;
        var optionList = $('<td class="display-field-input input-sm block" >');
        var name = DynamicForm.generateName(10);
        for (var i = 0; i < this.data["option-list"].length; i++) {
            var option = $('<div class="input-option">');
            var input = $('<input type="checkbox" >').attr({
                name: name
            });
            option.append(input);
            option.append('<span class="option-label">' + this.data["option-list"][i] + '</span>');

            optionList.append(option);
        }

        field.append(label.add(optionList));

        return field;
    }
    this.CheckboxGroup.prototype.doSave = function () {
        // calling parent method
        Object.getPrototypeOf(DynamicForm.CheckboxGroup.prototype).doSave.call(this);
        var dom = this.dom;
        var optionListDOM = dom.find('.option-list');

        optionListDOM.empty();
        for (var i = 0; i < this.data["option-list"].length; i++) {
            var option = $('<div class="sub-item">');
            var optionData = this.data["option-list"][i];
            var optionLabel = $('<label class="option-label">').text(optionData);

            option.append(optionLabel);
            optionListDOM.append(option);
        }

        var formField = dom.find(".field-item");
        var subSet = dom.find(".sub-set");
        if (subSet.length >= 1) {
            var subItem = subSet.children();
            var subSign = formField.find(".sub-sign");

            if (subItem.length >= 1) {

                if (subSign.length === 0) {
                    subSign = $('<i class="material-icons sub-sign">keyboard_arrow_down</i>');
                    formField.prepend(subSign);
                }

                formField.off("click.enable-viewing-sub-set");
                formField.on("click.enable-viewing-sub-set", {
                    subSet: subSet
                }, function (event) {
                    var subSet = event.data.subSet;
                    var isEnabled = subSet.hasClass("enabled");

                    if (isEnabled) {
                        subSet.removeClass("enabled");
                    } else {
                        subSet.addClass("enabled");
                    }
                });
            } else {
                subSign.remove();
            }
        }
    }
    this.CheckboxGroup.prototype.doValidate = function () {
        // calling parent method
        var passedValidation = Object.getPrototypeOf(DynamicForm.CheckboxGroup.prototype).doValidate.call(this);
        var value = this.getFieldValue();

        try {
            // Required Field
            if (this.data.isRequired) {
                if (value === "") {
                    passedValidation = false;
                }
            }
        } catch (error) {
            console.log(error)
        }

        return passedValidation;
    }

    // Dropdown List
    this.DropDownList = function (typeLabel, data) {
        // calling super class constructor
        DynamicForm.Field.call(this, "arrow_drop_down_circle", typeLabel, "drop_down_list", data);
    }
    this.DropDownList.prototype = Object.create(this.Field.prototype);
    this.DropDownList.constructor = this.DropDownList;
    this.DropDownList.prototype.toFieldDOM = function () {
        // calling parent method
        var dom = Object.getPrototypeOf(DynamicForm.DropDownList.prototype).toFieldDOM.call(this);
        dom.append('<div class="sub-set option-list">');

        return dom;
    }
    this.DropDownList.prototype.toPanelDOM = function () {
        // calling parent method
        var dom = Object.getPrototypeOf(DynamicForm.DropDownList.prototype).toPanelDOM.call(this);

        dom.append(this.createText("label", "Label", this.data.label));
        dom.append(this.createSwitch("isRequired", "Required Field", this.data.isRequired));
        var optionList = this.createOptionCreator("option-list", 'Options', this.data["option-list"], true);

        dom.append(optionList);

        return dom;
    }
    this.DropDownList.prototype.toDisplayDOM = function () {
        // calling parent method
        var field = Object.getPrototypeOf(DynamicForm.DropDownList.prototype).toDisplayDOM.call(this);
        var label = $('<td class="display-field-label">' + this.data.label + '</td>').attr({
            "data-isRequired": this.data.isRequired
        });;
        var optionList = $('<select class="field-input form-control">');
        for (var i = 0; i < this.data["option-list"].length; i++) {
            var option = $('<option value="' + i + '">' + this.data["option-list"][i] + '</option>');

            optionList.append(option);
        }
        var optionList = $('<td class="display-field-input input-sm" >').append(optionList);
        field.append(label.add(optionList));

        return field;
    }
    this.DropDownList.prototype.doSave = function () {
        // calling parent method
        Object.getPrototypeOf(DynamicForm.DropDownList.prototype).doSave.call(this);
        var dom = this.dom;
        var optionListDOM = dom.find('.option-list');

        optionListDOM.empty();
        for (var i = 0; i < this.data["option-list"].length; i++) {
            var option = $('<div class="sub-item">');
            var optionData = this.data["option-list"][i];
            var optionLabel = $('<label class="option-label">').text(optionData);

            option.append(optionLabel);
            optionListDOM.append(option);
        }

        var formField = dom.find(".field-item");
        var subSet = dom.find(".sub-set");
        if (subSet.length >= 1) {
            var subItem = subSet.children();
            var subSign = formField.find(".sub-sign");

            if (subItem.length >= 1) {

                if (subSign.length === 0) {
                    subSign = $('<i class="material-icons sub-sign">keyboard_arrow_down</i>');
                    formField.prepend(subSign);
                }

                formField.off("click.enable-viewing-sub-set");
                formField.on("click.enable-viewing-sub-set", {
                    subSet: subSet
                }, function (event) {
                    var subSet = event.data.subSet;
                    var isEnabled = subSet.hasClass("enabled");

                    if (isEnabled) {
                        subSet.removeClass("enabled");
                    } else {
                        subSet.addClass("enabled");
                    }
                });
            } else {
                subSign.remove();
            }
        }
    }

    // Toggle Button
    this.ToogleButton = function (typeLabel, data) {
        // calling super class constructor
        DynamicForm.Field.call(this, "invert_colors", typeLabel, "toggle_button", data);
    }
    this.ToogleButton.prototype = Object.create(this.Field.prototype);
    this.ToogleButton.constructor = this.ToogleButton;
    this.ToogleButton.prototype.toFieldDOM = function () {
        // calling parent method
        var dom = Object.getPrototypeOf(DynamicForm.ToogleButton.prototype).toFieldDOM.call(this);

        return dom;
    }
    this.ToogleButton.prototype.toPanelDOM = function () {
        // calling parent method
        var dom = Object.getPrototypeOf(DynamicForm.ToogleButton.prototype).toPanelDOM.call(this);

        dom.append(this.createText("label", "Label", this.data.label));
        dom.append(this.createSwitch("isRequired", "Required Field", this.data.isRequired));

        return dom;
    }
    this.ToogleButton.prototype.toDisplayDOM = function () {
        // calling parent method
        var field = Object.getPrototypeOf(DynamicForm.ToogleButton.prototype).toDisplayDOM.call(this);
        var label = $('<td class="display-field-label">' + this.data.label + '</td>').attr({
            "data-isRequired": this.data.isRequired
        });;
        var toggleButton = $('<label class="switch">');
        toggleButton.append('<input class="field-input" value="true" type="checkbox">');
        toggleButton.append('<span class="slider round">');
        toggleButton = $('<td class="display-field-input input-sm" >').append(toggleButton);
        field.append(label.add(toggleButton));

        return field;
    }

    // Datetime Picker
    this.DatetimePicker = function (typeLabel, data) {
        // calling super class constructor
        DynamicForm.Field.call(this, "date_range", typeLabel, "date_time_picker", data);
    }
    this.DatetimePicker.prototype = Object.create(this.Field.prototype);
    this.DatetimePicker.constructor = this.DatetimePicker;
    this.DatetimePicker.prototype.toFieldDOM = function () {
        // calling parent method
        var dom = Object.getPrototypeOf(DynamicForm.DatetimePicker.prototype).toFieldDOM.call(this);

        return dom;
    }
    this.DatetimePicker.prototype.toPanelDOM = function () {
        // calling parent method
        var dom = Object.getPrototypeOf(DynamicForm.DatetimePicker.prototype).toPanelDOM.call(this);

        dom.append(this.createText("label", "Label", this.data.label));
        dom.append(this.createSwitch("isRequired", "Required Field", this.data.isRequired));
        var startDatetime = this.createDatetimePicker("start-datetime", 'Start at', this.data["start-datetime"], true);
        var endDatetime = this.createDatetimePicker("end-datetime", 'End at', this.data["end-datetime"], true);

        dom.append(startDatetime.add(endDatetime));

        return dom;
    }
    this.DatetimePicker.prototype.toDisplayDOM = function () {
        // calling parent method
        var field = Object.getPrototypeOf(DynamicForm.DatetimePicker.prototype).toDisplayDOM.call(this);
        var label = $('<td class="display-field-label">' + this.data.label + '</td>').attr({
            "data-isRequired": this.data.isRequired
        });;
        var datepicker = $('<input class="field-input form-control" type="text">');
        datepicker.datepicker({
            dateFormat: "dd-mm-yy",
        });
        datepicker = $('<td class="display-field-input input-sm" >').append(datepicker);
        field.append(label.add(datepicker));

        return field;
    }
    this.DatetimePicker.prototype.doValidate = function () {
        // calling parent method
        var passedValidation = Object.getPrototypeOf(DynamicForm.DatetimePicker.prototype).doValidate.call(this);
        var value = this.getFieldValue();
        console.log(value)

        try {
            // Required Field
            if (this.data.isRequired) {
                if (value === "") {
                    passedValidation = false;
                }
            }

            // Date selection range
            var date = Date.parse(value);
            var startDate = Date.parse(this.data["start-datetime"]);
            // return false if the selected date is not between start date and end date
            if (!(date >= startDate)) {
                passedValidation = false;
            }
            var endDate = Date.parse(this.data["end-datetime"]);
            if (!(date <= endDate)) {
                passedValidation = false;
            }
        } catch (error) {
            console.log(error)
        }

        return passedValidation;
    }

    // File Upload
    this.FileUpload = function (typeLabel, data) {
        //calling super class constructor
        DynamicForm.Field.call(this, "insert_drive_file", typeLabel, "file_upload", data);
    }
    this.FileUpload.prototype = Object.create(this.Field.prototype);
    this.FileUpload.constructor = this.FileUpload;
    this.FileUpload.prototype.toFieldDOM = function () {
        // calling parent method
        var dom = Object.getPrototypeOf(DynamicForm.FileUpload.prototype).toFieldDOM.call(this);

        return dom;
    }
    this.FileUpload.prototype.toPanelDOM = function () {
        // calling parent method
        var dom = Object.getPrototypeOf(DynamicForm.FileUpload.prototype).toPanelDOM.call(this);

        dom.append(this.createText("label", "Label", this.data.label));
        dom.append(this.createSwitch("isRequired", "Required Field", this.data.isRequired));
        var options = this.createDropdown("data-file-type", 'File Type', ["All", "Image (JPG / GIF / PNG)", "DOC (Word)", "PDF"], this.data["data-file-type"]);

        dom.append(options);

        return dom;
    }
    this.FileUpload.prototype.toDisplayDOM = function () {
        // calling parent method
        var field = Object.getPrototypeOf(DynamicForm.FileUpload.prototype).toDisplayDOM.call(this);
        var label = $('<td class="display-field-label">' + this.data.label + '</td>').attr({
            "data-isRequired": this.data.isRequired
        });;
        var datepicker = $('<input class="field-input form-control" type="file">');
        datepicker = $('<td class="display-field-input input-sm" >').append(datepicker);
        field.append(label.add(datepicker));

        return field;
    }

    // following is the predefinded field extend from the sub-class of Field
    // benefit is that the icon for each predefined field is changeable and be kept after refreshing the page
    // --Basic Fields--
    // class FirstName extends TextField
    this.FirstName = function (typeLabel, data) {
        // calling constructor from super class, TextField
        DynamicForm.TextField.call(this, "First Name", data);
        // set the type name and icon to predefined values
        this.setICON.call(this, "person");
        this.setType.call(this, "first_name");
    }
    this.FirstName.prototype = Object.create(this.TextField.prototype);
    this.FirstName.constructor = this.TextField;

    // class LastName extends TextField
    this.LastName = function (typeLabel, data) {
        DynamicForm.TextField.call(this, "Last Name", data);
        this.setICON.call(this, "person");
        this.setType.call(this, "last_name");
    }
    this.LastName.prototype = Object.create(this.TextField.prototype);
    this.LastName.constructor = this.TextField;

    // class Email extends TextField
    this.Email = function (typeLabel, data) {
        DynamicForm.TextField.call(this, "Email", data);
        this.setICON.call(this, "email");
        this.setType.call(this, "email");
    }
    this.Email.prototype = Object.create(this.TextField.prototype);
    this.Email.constructor = this.TextField;

    // class PhoneNumber extends TextField
    this.PhoneNumber = function (typeLabel, data) {
        DynamicForm.TextField.call(this, "Phone Number", data);
        this.setICON.call(this, "phone");
        this.setType.call(this, "phone_number");
    }
    this.PhoneNumber.prototype = Object.create(this.TextField.prototype);
    this.PhoneNumber.constructor = this.TextField;
};
DynamicForm = new DynamicForm();

// Main program
// Predefined Fields with its values
var basicFields = [
    new DynamicForm.FirstName(null, {
        label: "First Name",
        "data-type": 1,
        isRequired: true,
        "min-length": 1,
        "max-length": 64,
        regex: '^[A-z\\u4E00-\\u9FFF\\u3400-\\u4DFF\\s ]*$'
    }), new DynamicForm.LastName(null, {
        label: "Last Name",
        "data-type": 1,
        isRequired: true,
        "min-length": 1,
        "max-length": 64,
        regex: '^[A-z\\u4E00-\\u9FFF\\u3400-\\u4DFF\\s ]*$'
    }), new DynamicForm.Email(null, {
        label: "Email",
        "data-type": 0,
        isRequired: true,
        "min-length": 4,
        "max-length": 320,
        regex: '^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$'
    }), new DynamicForm.PhoneNumber(null, {
        label: "Phone Number",
        "data-type": 2,
        isRequired: true,
        "min-length": 8,
        "max-length": 17,
        regex: '^[0-9]*$'
    })
]
// Custom Fields
var dynamicFields = [
    new DynamicForm.Label("Label", {
        label: "Label"
    }),
    new DynamicForm.TextField("Text", {
        label: "Text",
        "data-type": 0,
        isRequired: false,
    }),
    new DynamicForm.NumberField("Number", {
        label: "Number",
        isRequired: false,
        max: 0,
        min: 0
    }),
    new DynamicForm.TextAreaField("Text Area", {
        label: "Text Area",
        isRequired: false,
    }),
    new DynamicForm.RadioButtonGroup("Radio Button Group", {
        label: "Radio Button Group",
        isRequired: false,
        "option-list": [""]
    }),
    new DynamicForm.CheckboxGroup("Checkbox Group", {
        label: "Checkbox Group",
        isRequired: false,
        "option-list": [""]
    }),
    new DynamicForm.DropDownList("Dropdown List", {
        label: "Dropdown List",
        isRequired: false,
        "option-list": [""]
    }),
    new DynamicForm.ToogleButton("Toggle Button", {
        label: "Toggle Button",
        isRequired: false,
    }),
    new DynamicForm.DatetimePicker("Date / Time Picker", {
        label: "Date / Time Picker",
        isRequired: false,
    }),
    new DynamicForm.FileUpload("File Upload", {
        label: "File Upload",
        isRequired: false,
    })
]
// Adding predefined fields and custom fields with default values to the available item list
for (var i = 0; i < basicFields.length; i++) {
    DynamicForm.availableItemSet.addItem(basicFields[i], "Basic Fields");
}
for (var i = 0; i < dynamicFields.length; i++) {
    DynamicForm.availableItemSet.addItem(dynamicFields[i], "Dynamic Fields");
}

// Enable the available item list
DynamicForm.availableItemSet.enableItemList();

// Get parameters from the url
var communityID = $.urlParam("communityID");
var formID = $.urlParam("form-id");
// Declare a database refence connected to the specific path of table
var ref = firebase.database().ref("Community/" + communityID + "/FormSet");
var formDataObject = {};
var forms = [];

try {
    DynamicForm.formSaveController.setRef(ref);
    ref.once("value").then(function (data) {
        if (data.val() != null) {
            form = data.val();
            formDataObject = form[formID];
            // process the JSON object and display
            DynamicForm.formEditController.setFormDataObject(formDataObject);
            DynamicForm.formEditController.loadFormFromDataObject();
        }
    });
} catch (error) {
    console.log(error)
}