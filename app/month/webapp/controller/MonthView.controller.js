sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",

],
    function (Controller, Fragment, MessageToast) {
        "use strict";

        return Controller.extend("kharcha.month.controller.MonthView", {
            onInit: function () {
                const viewInfoModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(viewInfoModel, "viewInfo");
                const appInfoModel = new sap.ui.model.json.JSONModel({
                    'editMode': false
                });
                this.getView().setModel(appInfoModel, "appInfo");
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("MonthView").attachPatternMatched(this._onObjectMatched, this);
            },
            _onObjectMatched: function (oEvent) {
                const monthName = oEvent.getParameter("arguments").month_name;
                const year = oEvent.getParameter("arguments").year;
                this.loadData(monthName, year)

            },
            loadData(month_name, year) {
                const oDataModel = this.getOwnerComponent().getModel()
                const that = this;
                oDataModel.read(`/Month(month_name='${month_name}',year='${year}')`, {
                    urlParameters: {
                        "$expand": "to_Items"
                    },
                    success: function (data) {
                        that.getView().getModel('viewInfo').setProperty('/', data)

                    },
                    error: function (error) {
                        MessageToast.show('No Data Found!!!')
                        sap.ui.core.UIComponent.getRouterFor(that).navTo("RouteList");
                    }
                });
            },
            onAddTable: function () {
                var oModel = this.getView().getModel("viewInfo");
                var oData = oModel.getProperty("/to_Items/results") || [];
                var oNewEntry = {
                    month_name: "",
                    year: null
                };
                oData.push(oNewEntry);
                this.getView()
                    .getModel("viewInfo")
                    .setProperty("/to_Items/results", oData);
            },
            onDeleteTable: function (oEvent) {
                const viewInfoModel = this.getView().getModel('viewInfo')
                const sPath = +this.byId('idmTable').getSelectedContextPaths()[0].split('/')[3];
                if (sPath > -1) {
                    const itemData = viewInfoModel.getProperty('/to_Items/results');
                    itemData.splice(sPath);
                    viewInfoModel.setProperty('/to_Items/results', itemData)

                }
                else {
                    MessageToast.show('Please Select Row First')
                }
            },
            showCategoryVH: function (oEvent) {
                const selectRowContext = oEvent.getSource().getBindingContext('viewInfo').sPath
                this.getView().getModel('appInfo').setProperty('/selectedRowContext', selectRowContext)

                Fragment.load({
                    id: this.getView().getId(),
                    name: "kharcha.month.view.fragment.CategoryVH",
                    controller: this
                }).then(function (oDialog) {
                    this._oCategoryDialog = oDialog;
                    this.getView().addDependent(this._oCategoryDialog);
                    this._oCategoryDialog.open();
                }.bind(this));

            },
            onCancelDialog: function () {
                this._oCategoryDialog.destroy();
            },

            onPressCategory: function (oEvent) {
                const selectCategory = oEvent.getParameters().listItem.getBindingContext().getObject().name;
                const path = this.getView().getModel('appInfo').getProperty('/selectedRowContext');
                this.getView().getModel('viewInfo').setProperty(`${path}/to_Category_name`, selectCategory);
                this._oCategoryDialog.destroy()

            },
            onSave() {
                const viewInfoData = this.getView().getModel('viewInfo').getData()
                const that = this;
                let aItem = []
                viewInfoData.to_Items.results.forEach((item) => {
                    aItem.push({
                        "name": item.name,
                        "remarks": item.remarks,
                        "amount": item.amount,
                        "to_Category_name": item.to_Category_name
                    })
                })
                const oPayload = {
                    "to_Items": aItem
                }
                var oModel = this.getOwnerComponent().getModel();
                oModel.update(`/Month(month_name='${viewInfoData.month_name}',year='${viewInfoData.year}')`, oPayload, {
                    method: "PUT",
                    success: function (oData, oResponse) {
                        MessageToast.show('Data Updates Succesfully')
                        that.getView().getModel('appInfo').setProperty('/editMode', false)
                        that.loadData(viewInfoData.month_name, viewInfoData.year)
                    },
                    error: function (error) {
                        MessageToast.show(error.message)
                    }
                })
            },
            onEditButtonPress: function () {
                this.getView().getModel('appInfo').setProperty('/editMode', true)
            },
            onCancel() {
                this.getView().getModel('appInfo').setProperty('/editMode', false)
                const viewInfoData = this.getView().getModel('viewInfo').getData();
                this.loadData(viewInfoData.month_name, viewInfoData.year)
            },
        });
    });
