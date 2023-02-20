// webworker模式处理目录数据


/********************************************************************
 * @description 树形控件类
 * @class Tree
 * @author WZW
 * @constructor
 *******************************************************************/
class Tree {
    // define
    DATA = {};
    // define wrap data
    id = "";
    oContainer = null;
    oCheckedId = {};
    bCheck = false;
    nodeId = 0;
    editable = false;
    editGroupHtml = "";
    // 是否显示节点图标
    showIcon = false;
    // define icon
    _icon_map = {
        TXT: "icon-txt",
        PDF: "icon-pdf",
        // word
        DOC: "icon-word",
        DOCX: "icon-word",
        // excel
        XLS: "icon-excel",
        XLSX: "icon-excel",
        // ppt
        PPTX: "icon-ppt",
        // pic 
        PNG: "icon-pic",
        GIF: "icon-pic",
        JPEG: "icon-pic",
        JPG: "icon-pic",
        PSD: "icon-pic",
        PDD: "icon-pic",
    };

    constructor(x, y) {
        // this.id = "";
        // this.oContainer = null;
        // // this.DATA = {};
        // this.oCheckedId = {};
        // this.bCheck = false;
        // this.nodeId = 0;
        // this.editable = false;
        // this.editGroupHtml = "";
    }

    /*********************************************************************
     * @description 外部设置参数
     * @method setParams
     * @for 所属类名
     * @param { Object } obj 参数对象
     *  eg:obj = {
     *      id: "tree_wrap",
     *      edit: ["add", "edit", "delete"],
     *      icon: true,
     *      done: () => {
     *           gobjTree.getData()
     *      }
     *  }
     * @return { Boolean } true || false
     *********************************************************************/
    setParams(obj) {
        if (typeof obj !== "object" || obj.constructor !== Object) {
            return false;
        }

        this.setId(obj.id);
        this.setEdit(obj.edit);
        this.showIcon = typeof obj.icon === "boolean" ? obj.icon : false;
        this.done = typeof obj.done === "function" ? obj.done : function () {};
    }

    /*********************************************************************
     * @description 设置容器id
     * @method setId
     * @for Tree
     * @param { String } str 标签id值
     * @return { Boolean } true || false
     *********************************************************************/
    setId(str) {
        if (typeof str !== "string" || str.trim() === "") {
            return false;
        }

        this.id = str;
        return true;
    }

    /*********************************************************************
     * @description 设置复选框
     * @method setCheck
     * @for Tree
     * @param { Boolean } b 是否支持复选
     *********************************************************************/
    setCheck(b) {
        if (b === true) {
            bCheck = true;
        }
    }

    /*********************************************************************
     * @description 设置编辑图标
     * @method setEdit
     * @for Tree
     * @param { Array } 编辑图标数组["add", "delete", "edit"]; 支持一个或多个
     *********************************************************************/
    setEdit(arr) {
        if (typeof arr === "object") {
            let len = arr.length;
            var str = "";
            for (let idx = 0; idx < len; idx++) {
                switch (arr[idx]) {
                    case "add":
                        if (str.indexOf("icon-add") === -1) {
                            str += "<span class='icon-add' data_editgp='add'></span>";
                        }
                        break;
                    case "delete":
                        if (str.indexOf("icon-delete") === -1) {
                            str += "<span class='icon-delete' data_editgp='del'></span>";
                        }
                        break;
                    case "edit":
                        if (str.indexOf("icon-edit") === -1) {
                            str += "<span class='icon-edit' data_editgp='edit'></span>";
                        }
                        break;
                    default:
                        break;
                }
            }
            this.editGroupHtml = str;
            if (str.trim()) {
                this.editable = true;
            }
        }
    }


    /*********************************************************************
     * @description 获取单项数据字符串
     * @method getItemHtml
     * @for Tree
     * @param { Object } 节点数据对象 { name:节点名称, strChild:子节点字符串, id:节点id, pid:父节点id }
     * @return { string } 节点字符串
     *********************************************************************/
    getItemHtml({
        id,
        pid,
        name = "",
        strChild = "",
        icon
    }) {
        // node_parent_container === (有子节点的节点)节点图标容器
        // n_icon_coustom === 自定义图标
        if (this.showIcon) {
            if (strChild) {
                icon = "icon-files";
            } else {
                icon = icon || "icon-file-default";
            }
        } else {
            icon = "";
        }

        let template =
            `<div id="tree_node_${id}" class="node_item" data_id='${id}' data_pid='${pid}'>
                <div class="node_label icon_open">
                    <span name='n_icon' class="node_parent_container ${strChild ? "icon-node" : "icon_no"}"></span>
                    <span name='n_icon_coustom' class='${icon}'></span>
                    ${this.bCheck ? `<span class='node_checkbox'><input type="checkbox" name="" id=""></span>` : ""}
                    <span name='n_name' class="node_name">${name}</span>
                    ${!this.editable ? "" : `<div name='n_egp' class="node_edit_group">${this.editGroupHtml}</div>`}
                </div>
                <div class="node_child node_open">${strChild}</div>
            </div>`;

        return template;
    }

    /*********************************************************************
     * @description 保存数据
     * @method saveData
     * @for Tree
     * @param { String } id 节点数据id
     * @param { Object } obj 节点数据对象
     *********************************************************************/
    saveData(id, obj) {
        this.DATA[id] = {
            id: obj.id,
            name: obj.name,
        };
    }

    /*********************************************************************
     * @description 渲染数据
     * @method render
     * @for Tree
     * @param { Array } aData 数据数组; 节点对象数据结构 {name:"", chilren:[]}
     * @return { Boolean } true || false
     *********************************************************************/
    render(aData) {
        if (typeof aData !== "object" || typeof aData[0] !== "object" || typeof aData[0].name !== "string") {
            return false;
        }

        this.DATA = {};
        var objContainer = {}
        // var objContainer = document.getElementById(this.id);
        // if (!objContainer) {
        //     return false;
        // }

        this.oContainer = objContainer;
        // save tree obj
        objContainer.OTREE = this;

        // 在原数组上添加id
        let itemId = 0;

        var loop = (aChild, pid) => {
            var itemHtml = "";
            let len = aChild.length;

            for (let idx = 0; idx < len; idx++) {
                const oItem = aChild[idx];

                if (!this.checkParam(oItem)) {
                    continue;
                }

                let icon_type = this.getIconType(oItem.name);

                itemId++;
                oItem.id = itemId;
                this.saveData(itemId, oItem);

                if (!oItem.children.length) {
                    itemHtml += this.getItemHtml({
                        name: oItem.name,
                        strChild: "",
                        id: oItem.id,
                        pid: pid,
                        icon: icon_type
                    });
                    continue;
                }

                let res = loop(oItem.children, itemId);
                itemHtml += this.getItemHtml({
                    name: oItem.name,
                    strChild: res,
                    id: oItem.id,
                    pid: pid,
                    icon: icon_type
                });
            }

            return itemHtml;
        };

        
        // objContainer.innerHTML = `<div class='w_tree_container'>${loop(aData, -1)}</div>`;
        // console.log(this.DATA);
        this.nodeId = itemId;
        // this.initEvent();
        if (typeof this.done === "function") {
            this.done();
        }

        return loop(aData, -1);
    }

    /*********************************************************************
     * @description 校验渲染数据单条对数据格式;
     * @method checkParam
     * @for Tree
     * @param { Object } obj 单挑数据对象
     * @return { Boolean } true || false
     *********************************************************************/
    checkParam(obj) {
        if (typeof obj !== "object") {
            return false;
        }

        if (typeof obj.name !== "string" || obj.name.trim() === "") {
            return false;
        }

        if (typeof obj.children !== "object" || obj.children.constructor !== Array) {
            return false;
        }

        return true;
    }

    /*********************************************************************
     * @description 获取节点图标类型
     * @method getIconType
     * @for 所属类名
     * @param { String } sName 节点名称
     * @return { String } 空字符串
     *********************************************************************/
    getIconType(sName = "") {
        if (!this.showIcon) {
            return "";
        }

        if (typeof sName !== "string" || !(sName = sName.trim())) {
            return "";
        }

        let uiSymbol = sName.lastIndexOf(".");
        if (uiSymbol === -1) {
            return "";
        }

        let sType = sName.substring(uiSymbol + 1).trim().toLocaleUpperCase();
        return this._icon_map[sType];
    }

    /*********************************************************************
     * @description 初始化节点事件
     * @method initEvent
     * @for Tree
     * @param { String } oParent 父级容器（默认为该树形最外层容器 oContainer ）
     *********************************************************************/
    initEvent(oParent) {
        let _this = this;
        if (oParent && typeof oParent.querySelectorAll === "function") {
            oParent = oParent;
        } else {
            oParent = this.oContainer;
        }

        oParent.querySelectorAll(".node_label").forEach((dom) => {
            dom.onclick = _this.clickNode;
            // dom.OTREE = _this;
        });
    }

    /*********************************************************************
     * @description  点击节点
     * @method clickNode
     * @for Tree
     * @param { Object } event 点击事件event
     *********************************************************************/
    clickNode(event) {
        let oTarget = event.target;
        let oTree = null;
        // get Parents tree
        let aTrees = document.querySelectorAll(".w_tree_container");
        let uiLen = aTrees.length;
        for (let idx = 0; idx < uiLen; idx++) {
            const el = aTrees[idx];
            if (el.contains(oTarget)) {
                oTree = el.parentNode.OTREE;
                break;
            }
        }

        if (!oTree) {
            return;
        }

        // checkbox
        if (event.target.nodeName === "INPUT") {
            let id = this.parentNode.getAttribute("data_id");

            if (event.target.checked) {
                oTree.oCheckedId[id] = true;
            } else {
                delete oTree.oCheckedId[id];
            }
            return;
        }

        let bIsEdit = true;
        // edit group
        switch (oTarget.getAttribute("data_editgp")) {
            case "add":
                oTree.addNode(this, oTree);
                break;
            case "del":
                oTree.deleteNode(this, oTree);
                break;
            case "edit":
                oTree.editNode(this, oTree);
                break;
            default:
                bIsEdit = false;
                break;
        }

        if (bIsEdit) {
            return;
        }

        // switch fold
        event.stopPropagation();
        this.classList.toggle("icon_open");
        if (this.nextElementSibling) {
            this.nextElementSibling.classList.toggle("node_open");
        }
    }

    getData() {
        return this.DATA;
    }

    /*********************************************************************
     * @description 获取选中的节点
     * @method getChecked
     * @for 所属类名
     * @return { Array } 节点数据数组
     *********************************************************************/
    getChecked() {
        let resArr = [];

        for (const key in this.oCheckedId) {
            if (Object.hasOwnProperty.call(this.oCheckedId, key)) {
                resArr.push(this.DATA[key]);
            }
        }
        return resArr;
    }

    // ********************************************************************* edit ********************************************************************* //
    /*********************************************************************
     * @description 添加节点
     * @method addNode
     * @for 所属类名
     * @param { domNode } 当前节点dom === node_child
     * @return { 返回值类型 } 返回值说明
     *********************************************************************/
    addNode(domNode, treeThis) {
        // node_child
        let oChild = domNode.nextElementSibling;
        if (!oChild) {
            return;
        }

        this.nodeId++;
        let oCurNodeId = domNode.parentNode.getAttribute("data_id");
        let obj = {
            id: this.nodeId,
            pid: oCurNodeId,
            name: `新的节点${this.nodeId}`,
            strChild: "",
        };
        let strHtml = this.getItemHtml(obj);
        if (!oChild.innerHTML.trim()) {
            let nodeIcon = domNode.children.namedItem("n_icon");
            nodeIcon.classList.add("icon-node");
            nodeIcon.classList.remove("icon_no");
        }
        // oChild.innerHTML = oChild.innerHTML + strHtml;
        oChild.innerHTML += strHtml;
        this.saveData(this.nodeId, obj);
        this.initEvent(oChild);
        if (typeof this.editCallback === "function") {
            this.editCallback("add", this.DATA[oCurNodeId]);
        }
    }

    deleteNode(domNode, treeThis) {
        let oCurNodeId = domNode.parentNode.getAttribute("data_id");
        // domNode.contentEditable = "true";

        if (typeof this.editCallback === "function") {
            this.editCallback("delete", this.DATA[oCurNodeId]);
        }
    }

    editNode(domNode, treeThis) {
        let oCurNodeId = domNode.parentNode.getAttribute("data_id");
        // let oText = domNode.children.namedItem("n_name");
        // if (oText) {
        //     domNode.setAttribute.is_edit = true;
        //     oText.contentEditable = "true";
        // }
        if (typeof this.editCallback === "function") {
            this.editCallback("edit", this.DATA[oCurNodeId]);
        }
    }

    /*********************************************************************
     * @description 设置节点编辑监听
     * @method onClickEdit
     * @for 所属类名
     * @param { Function } fn 点击编辑按钮之后调用的回调函数
     *********************************************************************/
    onClickEdit(fn) {
        if (typeof fn === "function") {
            this.editCallback = fn;
        }
    }
}

/********************************************************************
 * @description 构造文件 -> Tree 数据
 * @class constructFileToTree
 * @author WZW
 * @constructor
 *******************************************************************/
class constructFileToTree {
    constructor() {
        this.m_tree_data = [];
        this.m_obj_map = {};
    }

    getData(aFiles) {
        if (typeof aFiles !== "object" || aFiles.constructor !== FileList) {
            return false;
        }

        let ui_file_cnt = aFiles.length;
        for (var idx = 0; idx < ui_file_cnt; idx++) {
            if (aFiles[idx] && aFiles[idx].webkitRelativePath) {
                const str_path = aFiles[idx].webkitRelativePath;
                this.addChild(str_path);
            }
        }
        return this.m_tree_data;
    }

    addChild(str) {
        if (typeof str !== "string") {
            return "";
        }

        // 文件路径
        var arr_name = str.split("/");
        // 文件深度
        var ui_deep = arr_name.length;
        // 第一层目录去掉
        var ui_idx = 0;
        var parent_ark = {
            arr_parent: this.m_tree_data,
            str_parent: "",
        };

        while (ui_idx < ui_deep) {
            parent_ark = this.setItem(0, arr_name[ui_idx], parent_ark);
            ui_idx++;
        }
    }

    setItem(index, name, parent) {
        if (typeof index !== "number" || typeof name !== "string" || typeof parent !== "object") {
            return;
        }

        var str_key = parent.str_parent + "_" + index + "_" + name;

        if (!this.m_obj_map[str_key]) {
            this.m_obj_map[str_key] = true;
            parent.arr_parent.push({
                name: name,
                children: [],
            });
        }

        return {
            arr_parent: parent.arr_parent.length - 1 < 0 ? [] : parent.arr_parent[parent.arr_parent.length - 1].children,
            str_parent: str_key,
        };
    }
}


var obj_tree = new Tree()
var obj_file = new constructFileToTree()

// 接收外部发送的数据
onmessage = function (e) {
    let data = e ? e.data : ""
    let value = null
    if ((value = data.init_set)) {
        obj_tree.setParams(value)
        // obj_tree.render(data)
        // obj_tree.onClickEdit(function (type, data) {
        //     console.log("[编辑回调]", type, data);
        // })
        return
    }

    var file_value = null
    if ((file_value = data.file)) {
        console.time()
        var tree_data = obj_file.getData(file_value)
        var str_html = obj_tree.render(tree_data)
        console.timeEnd()
        postMessage({
            rendre: str_html
        })
        return
    }

    return
}