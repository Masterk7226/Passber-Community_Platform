// Dynamic Form
// By MAK Kai Chung
var DynamicForm = function () {
    this.backupList = {};
    try {
        this.backupList = JSON.parse(localStorage["community-form-backup"]);
    } catch (error) {

    }


    // Generate random ID
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

        return text
    }

    // Convert miliseconds to readable date
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

    // Generate random name
    this.generateName = function (length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length))
        }

        if ($("*[name=" + text + "]").length >= 1) {
            return generateName(length);
        }

        return text
    }

    // Form Display Controller
    var FormSaveController = function () {
        this.saveButton = $(".form-save-button");
        this.activateButton = $(".form-activate-button");
        this.additionalInfo = $("#additional-info");
        this.enabledWarning = false;
        this.saveButton.on("click.save-form", {
            controller: this
        }, function (event) {
            var saveController = event.data.controller;

            saveController.saveForm();
        });
    }
    FormSaveController.prototype.saveForm = function () {
        var jsonObject = DynamicForm.formSet.toJSONObject();

        jsonObject.isActivated = this.activateButton.find('input[type="checkbox"]').prop("checked");
        jsonObject.lastModified = $.now();
        var date = DynamicForm.toISODate(jsonObject.lastModified);
        forms[formID] = jsonObject;
        ref.set(forms);
        this.additionalInfo.find(".last-modified .modified-date").text(date);
        this.disableSaveWarning();
    }
    FormSaveController.prototype.backupForm = function (form) {
        var jsonObject = DynamicForm.formSet.toJSONObject();

        jsonObject.isActivated = this.activateButton.find('input[type="checkbox"]').prop("checked");
        jsonObject.lastModified = $.now();
        var date = DynamicForm.toISODate(jsonObject.lastModified);

        if (DynamicForm.backupList[communityID] == undefined) {
            DynamicForm.backupList[communityID] = {};
        }
        if (DynamicForm.backupList[communityID][formID] != undefined) {
            DynamicForm.backupList[communityID] = {};
        }
        DynamicForm.backupList[communityID][formID] = jsonObject;
        localStorage["community-form-backup"] = JSON.stringify(DynamicForm.backupList);
    }
    FormSaveController.prototype.enableSaveWarning = function () {
        if (!this.enabledWarning) {
            this.enabledWarning = true;
            $(window).on("beforeunload.save-warning", function () {
                return confirm("Are you sure you want to leave without saving?");
            });
            this.enableAutoSaving();
        }
    }
    FormSaveController.prototype.disableSaveWarning = function () {
        if (this.enabledWarning) {
            this.enabledWarning = false;
            $(window).off("beforeunload.save-warning");
            this.disableAutoSaving();
        }
    }
    FormSaveController.prototype.enableAutoSaving = function () {
        const interval = 5000;

        this.autoSaving = window.setInterval(function () {
            DynamicForm.formSaveController.backupForm();
        }, interval)
    }
    FormSaveController.prototype.disableAutoSaving = function () {
        window.clearInterval(this.autoSaving);
    }
    this.formSaveController = new FormSaveController();

    // Form Display Controller
    var FormEditController = function () {
        this.formDataObject = {};
        this.fieldTypes = {};
        this.displayForm = $(".form-container");
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
    FormEditController.prototype.loadFormFromDataObject = function () {
        this.displayForm.empty();

        // for (var i = 0; i < this.formDataObject.formSet.length; i++) {
        var formJSONObject = this.formDataObject;
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
        var memberType = formJSONObject.memberType;
        var form = new DynamicForm.Form(memberType);
        var date = DynamicForm.toISODate(formJSONObject.lastModified);
        try {
            DynamicForm.formSaveController.additionalInfo.find(".last-modified .modified-date").text(date);
        } catch (error) {

        }

        DynamicForm.formSaveController.activateButton.find('input[type="checkbox"]').prop({
            checked: formJSONObject.isActivated
        });
        DynamicForm.formSet.addForm(form);

        for (var fieldIndex = 0; fieldIndex < formJSONObject.fieldSet.length; fieldIndex++) {
            var fieldJSONObject = formJSONObject.fieldSet[fieldIndex];
            var fieldType = fieldJSONObject.type;
            var fieldData = fieldJSONObject.data;
            var fieldLabel = fieldData.label;
            var field = new DynamicForm[this.fieldTypes[fieldType]](fieldLabel, fieldData);
            var fieldDOM = field.toFieldDOM().appendTo(form.dom);

            field.setDOM(fieldDOM);
            field.doSave(false);
            form.addField(field, false);
        }
        // }
    }
    FormEditController.prototype.setFormDataObject = function (formDataObject) {
        this.formDataObject = formDataObject;
    }
    this.formController = new FormEditController();

    // Available Item Set
    var AvailableItemSet = function () {
        this.itemSet = [];
        this.itemList = $("#available-item-list");
        $(".back-button").on("click.back-to-list", function () {
            window.location.href = "form-list.html?communityID=" + communityID;
        });

        this.addItem = function (item, category) {
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
                    remove: function (event, ui) {
                        var id = ui.item.attr("data-id");
                        var field = DynamicForm.availableItemSet.getItemById(id);
                        var clonedField = $.extend(true, Object.create(Object.getPrototypeOf(DynamicForm.PanelContent)), field);
                        var clonedDOM = clonedField.toFieldDOM()
                            .insertAfter(ui.item);
                        clonedField.setDOM(clonedDOM);
                        DynamicForm.formSet.waitForProcessedField = clonedField;

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

    // Form Set
    var FormSet = function () {
        this.formSet = [];
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
                DynamicForm.formSet.tabContainer.tabs("refresh");
            }
        });

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
    FormSet.prototype.isExist = function (memberType) {
        for (var i = 0; i < this.formSet.length; i++) {
            try {
                if (this.formSet[i].memberType === memberType) {
                    return true;
                }
            } catch (error) {

            }
        }
        return false;
    }
    FormSet.prototype.addForm = function (form) {
        if (this.isExist(form.memberType)) {
            window.alert("Sorry, the member type has been existed.\nPlease try another title.");
            return;
        }

        var index = this.formSet.length;
        this.formSet[index] = form;

        var deleteButton = $('<i class="material-icons">close</i>');
        deleteButton.on("click.delete-form", {
            form: this.formSet[index]
        }, function (event) {
            var form = event.data.form;
            var confirmResult = window.confirm("Are you sure you want to delete this?\nPlease note that this action cannot be undone.");

            if (confirmResult === true) {
                DynamicForm.formSet.removeForm(form);
            }
        });
        var generatedID = DynamicForm.generateID(10, "form-");
        var tabLabel = $('<li data-form_id="' + index + '"></li>');
        tabLabel.append('<a href="#' + generatedID + '">' + form.memberType + '</a>');
        tabLabel.append(deleteButton);
        this.formList.find("#dynamic_form-tab-controls").prepend(tabLabel);
        var createdForm = $('<div class="form-container">').attr({
            id: generatedID,
            "data-form_id": index
        });
        this.formList.find("#dynamic_form-tab-controls").after(createdForm);
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
            sort: function (event, ui) {
                DynamicForm.formSaveController.enableSaveWarning();
            },
            receive: function (event, ui) {
                var formID = $(this).attr("data-form_id");
                var form = DynamicForm.formSet.getFormByID(formID);
                var field = DynamicForm.formSet.waitForProcessedField;
                form.addField(field);
            }
        });
        this.formSet[index].setDOM(createdForm);
        this.refreshTabs();
    }
    FormSet.prototype.removeForm = function (form) {
        var index = this.formSet.indexOf(form);
        this.removeFormByID(index);
    }
    FormSet.prototype.removeFormByID = function (id) {
        if (id != -1) {
            this.formList.find('#dynamic_form-tab-controls li[data-form_id="' + id + '"]').remove();
            this.formSet[id].dom.remove();
            this.refreshTabs();
            delete this.formSet[id];
        }
    }
    FormSet.prototype.refreshTabs = function () {
        this.formList.tabs("refresh");
        this.formList.tabs("option", "active", 0);
    }
    FormSet.prototype.getFormByID = function (id) {
        return this.formSet[id];
    }
    FormSet.prototype.getIdByForm = function (form) {
        return this.formSet.indexOf(form);
    }
    FormSet.prototype.toJSONObject = function () {
        var jsonObject = {};

        // for (var i = 0; i < this.formSet.length; i++) {
        var form = this.formSet[0];
        // var index = jsonObject.formSet.length;
        // if (this.formSet[0] === undefined) {
        //     continue;
        // }

        jsonObject = this.formSet[0].toJSONObject();
        // }

        return jsonObject;
    }
    this.formSet = new FormSet();

    // Preview Form Controller
    var PreviewFormController = function () {
        this.previewButton = $(".dynamic-form-button.form-preview-button");

        this.previewButton.on("click.preview-form", function () {
            DynamicForm.previewFormController.previewCurrentForm();
        });
    }
    PreviewFormController.prototype.previewCurrentForm = function () {
        var formID = DynamicForm.formSet.formList.tabs("instance").active.attr("data-form_id");

        if (formID != undefined) {
            this.previewFormByID(formID);
        }
    }
    PreviewFormController.prototype.updateCurrentPreview = function () {
        if (this.dom != undefined) {
            var formID = this.dom.attr("data-form_id");
        }

        if (formID != undefined) {
            this.previewFormByID(formID);
        }
    }
    PreviewFormController.prototype.previewFormByID = function (id) {
        var form = DynamicForm.formSet.getFormByID(id);

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
        this.dom = this.dom.empty().append(form.toDisplayDOM());
        this.dom.dialog("open");
    }
    this.previewFormController = new PreviewFormController();

    // Control Panel
    var ControlPanel = function () {
        this.panel = $("#item-manage-control");
        this.isEnabled = false;
        this.locked = false;

        this.enablePanel = function (panelContent, form) {
            if (this.locked) {
                return;
            }
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

            this.buildPanelContent(panelContent, form);
        }
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
        this.buildPanelContent = function (panelContent, form) {
            var content = panelContent.toPanelDOM();
            var formID = DynamicForm.formSet.getIdByForm(form);
            var fieldID = -1;
            try {
                fieldID = form.getIdByField(panelContent);
            } catch (error) {

            }
            content.attr({
                "data-form_id": formID,
                "data-field_id": fieldID
            })

            this.panel.append(content);
        }
        this.clearPanelContent = function (panelContent) {
            this.panel.empty();
        }
    }
    this.controlPanel = new ControlPanel()

    // Panel Content
    this.PanelContent = function (data) {
        this.setData.call(this, data);
    }
    this.PanelContent.prototype.setData = function (data) {
        this.data = data;
        try {
            this.doSave();
        } catch (error) {

        }
    }
    this.PanelContent.prototype.doSave = function () {

    }
    this.PanelContent.prototype.toPanelDOM = function () {
        var dom = $('<div class="tab-control">');

        return dom;
    }
    this.PanelContent.prototype.createHeader = function (header) {
        var dom = $('<div class="type-header">' + header + '</div>');

        return dom;
    }
    this.PanelContent.prototype.createText = function (name, label, value, isInline) {
        var dom = $('<div class="field-control ' + name + ' ' + ((isInline == true) ? "inline-field" : "") + '">');
        dom.append('<label class="field-text">' + label + '</label>');
        dom.append($('<input class="field-input form-control" type="text" >').val(((value != undefined) ? value : "")));

        return dom;
    }
    this.PanelContent.prototype.createTextarea = function (name, label, value, isInline, rows, cols) {
        var dom = $('<div class="field-control ' + name + ' ' + ((isInline == true) ? "inline-field" : "") + '">');
        dom.append('<label class="field-text">' + label + '</label>');
        dom.append($('<textarea class="field-input form-control" rows="' + rows + '" cols="' + cols + '" >').val(((value != undefined) ? value : "")));

        return dom;
    }
    this.PanelContent.prototype.createNumber = function (name, label, value, isInline, min, max) {
        var dom = $('<div class="field-control ' + name + ' ' + ((isInline == true) ? "inline-field" : "") + '">');
        dom.append('<label class="field-text">' + label + '</label>');
        dom.append('<input class="field-input form-control" type="number" ' + ((min != undefined) ? 'min="' + min + '"' : "") + ' ' + ((max != undefined) ? 'max="' + max + '"' : "") + ' value=' + ((value != undefined) ? value : "") + ' >');

        return dom;
    }
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

    //Form
    this.Form = function (memberType, data) {
        DynamicForm.PanelContent.call(this, data);

        this.memberType = memberType;
        this.fieldSet = [];

        this.addField = function (field, enabledWarning) {
            var index = this.fieldSet.length;
            this.fieldSet[index] = field;
            this.fieldSet[index].setForm(this);
            this.fieldSet[index].dom.attr({
                "data-id": index
            });
            this.fieldSet[index].dom.find(".form-edit-control.edit").on("click.form-edit", {
                form: this,
                field: field
            }, function (event) {
                var form = event.data.form;
                var field = event.data.field;

                DynamicForm.formSet.enableFieldEdition(field, form);
            });
            this.fieldSet[index].dom.find(".form-edit-control.delete").on("click.form-delete", {
                form: this,
                field: field
            }, function (event) {
                var form = event.data.form;
                var field = event.data.field;

                form.removeField(field);
            });

            if (enabledWarning === false) {
                DynamicForm.formSaveController.disableSaveWarning();
            } else {
                DynamicForm.formSaveController.enableSaveWarning();
            }
        }
        this.removeField = function (field) {
            var index = this.fieldSet.indexOf(field);
            this.removeFieldById(index);
            DynamicForm.formSaveController.enableSaveWarning();
        }
        this.removeFieldById = function (id) {
            this.fieldSet[id].dom.remove();
            delete this.fieldSet[id];
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
    this.Form.prototype.toDisplayDOM = function () {
        var dom = $('<div class="custom-form-container">');
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

        var headline = $('<tr class="display-field display-field-combined" data-type="member_type" colspan="2">');
        headline.text(this.memberType);
        dom.prepend(headline);

        return dom;
    }
    this.Form.prototype.toJSONObject = function () {
        var jsonObject = {
            memberType: this.memberType,
            fieldSet: []
        };
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

    // Field Items
    this.Field = function (icon, typeLabel, type, data) {
        DynamicForm.PanelContent.call(this, data);
        this.icon = icon;
        this.typeLabel = typeLabel;
        this.type = type;
    };
    this.Field.prototype = Object.create(this.PanelContent.prototype);
    this.Field.constructor = this.Field;
    this.Field.prototype.setForm = function (form) {
        this.form = form;
    }
    this.Field.prototype.setType = function (type) {
        this.type = type;
    }
    this.Field.prototype.toFieldDOM = function () {
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
    this.Field.prototype.toPanelDOM = function () {
        var dom = Object.getPrototypeOf(DynamicForm.Field.prototype).toPanelDOM.call(this);
        var saveButton = $('<input type="button" class="control-save" value="Save">');
        saveButton.on("click.save-data", function (event) {
            var formID = DynamicForm.controlPanel.panel.find(".tab-control").attr("data-form_id");
            var form = DynamicForm.formSet.getFormByID(formID);
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

                // Preserve the escape string from text value before stroring them to the data object
                data[name] = $(allInputs[i]).val();
            }

            field.setData(data);
        });
        dom.append(saveButton);
        dom.append(this.createHeader(this.typeLabel));

        return dom;
    }
    this.Field.prototype.getFieldSize = function (length) {
        length = parseInt(length);
        var fontSize = parseFloat($("body").css("font-size"));
        var size = fontSize * length;

        if (size < fontSize * 4) {
            size = fontSize * 4;
        }

        return size;
    }
    this.Field.prototype.toDisplayDOM = function () {
        var field = $('<tr class="display-field" data-type="' + this.type + '">');

        return field;
    }
    this.Field.prototype.toJSONObject = function () {
        var jsonObject = {};
        jsonObject.type = this.type;
        jsonObject.data = this.data;

        return jsonObject;
    }
    this.Field.prototype.doSave = function (enabledWarning) {
        Object.getPrototypeOf(DynamicForm.Field.prototype).doSave.call(this);
        var formField = this.dom.find(".field-item");
        formField.find(".form-label").text(this.data.label);
        formField.find(".form-required").attr({
            "data-required": this.data.isRequired
        });

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

    // Label
    this.Label = function (typeLabel, data) {
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

    // Text Field
    this.TextField = function (typeLabel, data) {
        DynamicForm.Field.call(this, "text_format", typeLabel, "text_box", data);
    }
    this.TextField.prototype = Object.create(this.Field.prototype);
    this.TextField.constructor = this.TextField;
    this.TextField.prototype.toFieldDOM = function () {
        var dom = Object.getPrototypeOf(DynamicForm.TextField.prototype).toFieldDOM.call(this);

        return dom;
    }
    this.TextField.prototype.toPanelDOM = function () {
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

    // Number Field
    this.NumberField = function (typeLabel, data) {
        DynamicForm.Field.call(this, "looks_one", typeLabel, "number_field", data);
    }
    this.NumberField.prototype = Object.create(this.Field.prototype);
    this.NumberField.constructor = this.NumberField;
    this.NumberField.prototype.toFieldDOM = function () {
        var dom = Object.getPrototypeOf(DynamicForm.NumberField.prototype).toFieldDOM.call(this);

        return dom;
    }
    this.NumberField.prototype.toPanelDOM = function () {
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

    // Text Area Field
    this.TextAreaField = function (typeLabel, data) {
        DynamicForm.Field.call(this, "text_fields", typeLabel, "text_area", data);

        this.colTextAomunt = 50;
    }
    this.TextAreaField.prototype = Object.create(this.Field.prototype);
    this.TextAreaField.constructor = this.TextAreaField;
    this.TextAreaField.prototype.toFieldDOM = function () {
        var dom = Object.getPrototypeOf(DynamicForm.TextAreaField.prototype).toFieldDOM.call(this);

        return dom;
    }
    this.TextAreaField.prototype.toPanelDOM = function () {
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
        var field = Object.getPrototypeOf(DynamicForm.TextAreaField.prototype).toDisplayDOM.call(this);
        field.append('<label class="display-field-label">' + this.data.label + '</label>').attr({
            "data-isRequired": this.data.isRequired
        });;
        field.append('<input type="text" value="' + ((this.data.value != undefined) ? this.data.value : "") + '" placeholder="' + ((this.data.placeholder != undefined) ? this.data.placeholder : "") + '" >');

        return field;
    }
    this.TextAreaField.prototype.toDisplayDOM = function () {
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

    // Radio Button Group
    this.RadioButtonGroup = function (typeLabel, data) {
        DynamicForm.Field.call(this, "radio_button_checked", typeLabel, "radio_button_group", data);
    }
    this.RadioButtonGroup.prototype = Object.create(this.Field.prototype);
    this.RadioButtonGroup.constructor = this.RadioButtonGroup;
    this.RadioButtonGroup.prototype.toFieldDOM = function () {
        var dom = Object.getPrototypeOf(DynamicForm.RadioButtonGroup.prototype).toFieldDOM.call(this);
        dom.append('<div class="sub-set option-list">');

        return dom;
    }
    this.RadioButtonGroup.prototype.toPanelDOM = function () {
        var dom = Object.getPrototypeOf(DynamicForm.RadioButtonGroup.prototype).toPanelDOM.call(this);

        dom.append(this.createText("label", "Label", this.data.label));
        dom.append(this.createSwitch("isRequired", "Required Field", this.data.isRequired));
        var optionList = this.createOptionCreator("option-list", 'Options', this.data["option-list"], true);

        dom.append(optionList);

        return dom;
    }
    this.RadioButtonGroup.prototype.toDisplayDOM = function () {
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

    // Checkbox Group
    this.CheckboxGroup = function (typeLabel, data) {
        DynamicForm.Field.call(this, "check_box", typeLabel, "checkbox_group", data);
    }
    this.CheckboxGroup.prototype = Object.create(this.Field.prototype);
    this.CheckboxGroup.constructor = this.CheckboxGroup;
    this.CheckboxGroup.prototype.toFieldDOM = function () {
        var dom = Object.getPrototypeOf(DynamicForm.CheckboxGroup.prototype).toFieldDOM.call(this);
        dom.append('<div class="sub-set option-list">');

        return dom;
    }
    this.CheckboxGroup.prototype.toPanelDOM = function () {
        var dom = Object.getPrototypeOf(DynamicForm.CheckboxGroup.prototype).toPanelDOM.call(this);

        dom.append(this.createText("label", "Label", this.data.label));
        dom.append(this.createSwitch("isRequired", "Required Field", this.data.isRequired));
        var optionList = this.createOptionCreator("option-list", 'Options', this.data["option-list"], true);

        dom.append(optionList);

        return dom;
    }
    this.CheckboxGroup.prototype.toDisplayDOM = function () {
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

    // Dropdown List
    this.DropDownList = function (typeLabel, data) {
        DynamicForm.Field.call(this, "arrow_drop_down_circle", typeLabel, "drop_down_list", data);
    }
    this.DropDownList.prototype = Object.create(this.Field.prototype);
    this.DropDownList.constructor = this.DropDownList;
    this.DropDownList.prototype.toFieldDOM = function () {
        var dom = Object.getPrototypeOf(DynamicForm.DropDownList.prototype).toFieldDOM.call(this);
        dom.append('<div class="sub-set option-list">');

        return dom;
    }
    this.DropDownList.prototype.toPanelDOM = function () {
        var dom = Object.getPrototypeOf(DynamicForm.DropDownList.prototype).toPanelDOM.call(this);

        dom.append(this.createText("label", "Label", this.data.label));
        dom.append(this.createSwitch("isRequired", "Required Field", this.data.isRequired));
        var optionList = this.createOptionCreator("option-list", 'Options', this.data["option-list"], true);

        dom.append(optionList);

        return dom;
    }
    this.DropDownList.prototype.toDisplayDOM = function () {
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
        DynamicForm.Field.call(this, "invert_colors", typeLabel, "toggle_button", data);
    }
    this.ToogleButton.prototype = Object.create(this.Field.prototype);
    this.ToogleButton.constructor = this.ToogleButton;
    this.ToogleButton.prototype.toFieldDOM = function () {
        var dom = Object.getPrototypeOf(DynamicForm.ToogleButton.prototype).toFieldDOM.call(this);

        return dom;
    }
    this.ToogleButton.prototype.toPanelDOM = function () {
        var dom = Object.getPrototypeOf(DynamicForm.ToogleButton.prototype).toPanelDOM.call(this);

        dom.append(this.createText("label", "Label", this.data.label));
        dom.append(this.createSwitch("isRequired", "Required Field", this.data.isRequired));

        return dom;
    }
    this.ToogleButton.prototype.toDisplayDOM = function () {
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
        DynamicForm.Field.call(this, "date_range", typeLabel, "date_time_picker", data);
    }
    this.DatetimePicker.prototype = Object.create(this.Field.prototype);
    this.DatetimePicker.constructor = this.DatetimePicker;
    this.DatetimePicker.prototype.toFieldDOM = function () {
        var dom = Object.getPrototypeOf(DynamicForm.DatetimePicker.prototype).toFieldDOM.call(this);

        return dom;
    }
    this.DatetimePicker.prototype.toPanelDOM = function () {
        var dom = Object.getPrototypeOf(DynamicForm.DatetimePicker.prototype).toPanelDOM.call(this);

        dom.append(this.createText("label", "Label", this.data.label));
        dom.append(this.createSwitch("isRequired", "Required Field", this.data.isRequired));
        var startDatetime = this.createDatetimePicker("start-datetime", 'Start at', this.data["start-datetime"], true);
        var endDatetime = this.createDatetimePicker("end-datetime", 'End at', this.data["end-datetime"], true);

        dom.append(startDatetime.add(endDatetime));

        return dom;
    }
    this.DatetimePicker.prototype.toDisplayDOM = function () {
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

    // File Upload
    this.FileUpload = function (typeLabel, data) {
        DynamicForm.Field.call(this, "insert_drive_file", typeLabel, "file_upload", data);
    }
    this.FileUpload.prototype = Object.create(this.Field.prototype);
    this.FileUpload.constructor = this.FileUpload;
    this.FileUpload.prototype.toFieldDOM = function () {
        var dom = Object.getPrototypeOf(DynamicForm.FileUpload.prototype).toFieldDOM.call(this);

        return dom;
    }
    this.FileUpload.prototype.toPanelDOM = function () {
        var dom = Object.getPrototypeOf(DynamicForm.FileUpload.prototype).toPanelDOM.call(this);

        dom.append(this.createText("label", "Label", this.data.label));
        dom.append(this.createSwitch("isRequired", "Required Field", this.data.isRequired));
        var options = this.createDropdown("data-file-type", 'File Type', ["All", "Image (JPG / GIF / PNG)", "DOC (Word)", "PDF"], this.data["data-file-type"]);

        dom.append(options);

        return dom;
    }
    this.FileUpload.prototype.toDisplayDOM = function () {
        var field = Object.getPrototypeOf(DynamicForm.FileUpload.prototype).toDisplayDOM.call(this);
        var label = $('<td class="display-field-label">' + this.data.label + '</td>').attr({
            "data-isRequired": this.data.isRequired
        });;
        var datepicker = $('<input class="field-input form-control" type="file">');
        datepicker = $('<td class="display-field-input input-sm" >').append(datepicker);
        field.append(label.add(datepicker));

        return field;
    }

    // Basic Fields
    // First Name Field
    this.FirstName = function (typeLabel, data) {
        DynamicForm.TextField.call(this, "First Name", data);
        this.setICON.call(this, "person");
        this.setType.call(this, "first_name");
    }
    this.FirstName.prototype = Object.create(this.TextField.prototype);
    this.FirstName.constructor = this.TextField;

    // Last Name Field
    this.LastName = function (typeLabel, data) {
        DynamicForm.TextField.call(this, "Last Name", data);
        this.setICON.call(this, "person");
        this.setType.call(this, "last_name");
    }
    this.LastName.prototype = Object.create(this.TextField.prototype);
    this.LastName.constructor = this.TextField;

    // Email Field
    this.Email = function (typeLabel, data) {
        DynamicForm.TextField.call(this, "Email", data);
        this.setICON.call(this, "email");
        this.setType.call(this, "email");
    }
    this.Email.prototype = Object.create(this.TextField.prototype);
    this.Email.constructor = this.TextField;

    // Phone Number Field
    this.PhoneNumber = function (typeLabel, data) {
        DynamicForm.TextField.call(this, "Phone Number", data);
        this.setICON.call(this, "phone");
        this.setType.call(this, "phone_number");
    }
    this.PhoneNumber.prototype = Object.create(this.TextField.prototype);
    this.PhoneNumber.constructor = this.TextField;
};

DynamicForm = new DynamicForm();

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
for (var i = 0; i < basicFields.length; i++) {
    DynamicForm.availableItemSet.addItem(basicFields[i], "Basic Fields");
}
for (var i = 0; i < dynamicFields.length; i++) {
    DynamicForm.availableItemSet.addItem(dynamicFields[i], "Dynamic Fields");
}

DynamicForm.availableItemSet.enableItemList();

var communityID = $.urlParam("communityID");
var formID = $.urlParam("form-id");
var ref = firebase.database().ref("Community/" + communityID + "/FormSet");
var formDataObject = {};
var forms = [];

try {
    ref.once("value").then(function (data) {
        if (data.val() != null) {
            forms = data.val();
            console.log(forms, formID)
            formDataObject = forms[formID];
            DynamicForm.formController.setFormDataObject(formDataObject);
            DynamicForm.formController.loadFormFromDataObject();
        }
    });
} catch (error) {

}