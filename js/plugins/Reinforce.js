/*:
 * @plugindesc 物品自定义功能
 * @author EskiNott & Hale Lin
 *
 * @help
 * =>插件使用初始化
 * 请在技能栏6号技能处添加一个空的无效技能用于占位，并在能够自定义的武器和装备中添加该技能，技能数量为附加状态\技能槽位
 * 技能栏位置可以在变量中修改
 * 
 * =>为强化素材添加类型
 * 在注释中写入以下内容
 * <REINFORCE MATERIAL>
 * type = 强化素材类型  该行填入的关键字在插件参数中可自定义
 * multiplier = 强化倍率  该行在type为武器强化素材或装备强化素材时有效，分别为武器强化一次后物理攻击力和魔法攻击力变化和护甲强化一次后物理防御力和魔法防御力变化
 * 当type为weaponComponentTypeName时添加以下参数
 * <COMPONENT STATE>
 * code = 特性ID
 * dataId = 特性中分项ID
 * value = 特性值
 * </COMPONENT STATE>
 * </REINFORCE MATERIAL>
 * 
 * =>为可强化武器/装备添加强化次数
 * 在注释中写入以下内容
 * (该内容决定使用强化素材而非配件强化数量)
 * <MATERIAL UPDATE>
 * maxTimes = 最大强化次数
 * nowTimes = 现在的强化次数
 * </MATERIAL UPDATE>
 * 
 * =>为可强化武器/装备添加改造次数
 * 在注释中写入以下内容
 * (该内容与上文提到的技能栏6号技能有关，在maxTimes参数中设置武器/装备上添加了多少个该技能，该项决定该武器最大配件数量)
 * <COMPONENT UPDATE>
 * maxTimes = 最大强化次数
 * nowTimes = 0
 * </COMPONENT UPDATE>
 * 
 * @param weaponComponentTypeName
 * @text 武器强化配件变量名称
 * @type string
 * @desc 用于定义武器强化配件变量名称
 * @default weaponComponent
 * 
 * @param emptySkill
 * @text 空技能栏位变量自定义
 * @type number
 * @desc 用于定义空技能栏位的位置
 * @default 6
 * 
 * @param weaponMaterialTypeName
 * @text 武器强化素材变量名称
 * @type string
 * @desc 用于定义武器强化素材变量名称
 * @default weaponMaterial
 * 
 * @param armourElementTypeName
 * @text 装备强化素材变量名称
 * @type string
 * @desc 用于定义装备强化素材变量名称
 * @default armourElement
 * 
 * @param MaterialUpdateLableName
 * @text 素材强化标签名
 * @type string
 * @desc 用于定义强化界面中素材强化的显示
 * @default 强化
 * 
 * @param ComponentUpdateLableName
 * @text 配件强化标签名
 * @type string
 * @desc 用于定义强化界面中配件强化的显示
 * @default 改造
 */
(() => {
    const PluginPara = PluginManager.parameters('Reinforce');
    DataManager.Reinforce = {}

    class CombatItem {
        isWeapon = true;
        MaterialUpdate = {
            MaxTimes: 0,
            NowTimes: 0,
            NowTimeDescIndex: 0
        }
        ComponentUpdate = {
            MaxTimes: 0,
            NowTimes: 0,
            NowTimeDescIndex: 0
        }
    }

    class Material {
        MaterialType = "";
        MaterialMultiplier = 1;
        Traits = {
            code: 0,
            dataId: 0,
            value: 0
        }
    }

    //修改存档逻辑
    DataManager.makeSaveContents = function () {
        // A save data does not contain $gameTemp, $gameMessage, and $gameTroop.
        // const contents = {};
        // contents.system = $gameSystem;
        // contents.screen = $gameScreen;
        // contents.timer = $gameTimer;
        // contents.switches = $gameSwitches;
        // contents.variables = $gameVariables;
        // contents.selfSwitches = $gameSelfSwitches;
        // contents.actors = $gameActors;
        // contents.party = $gameParty;
        // contents.map = $gameMap;
        // contents.player = $gamePlayer;
        // return contents;
        const contents = {};
        contents.system = $gameSystem;
        contents.screen = $gameScreen;
        contents.timer = $gameTimer;
        contents.switches = $gameSwitches;
        contents.variables = $gameVariables;
        contents.selfSwitches = $gameSelfSwitches;
        contents.actors = $gameActors;
        contents.party = $gameParty;
        contents.map = $gameMap;
        contents.player = $gamePlayer;
        contents.weapon = $dataWeapons;
        contents.armour = $dataArmors;
        return contents;
    }

    DataManager.extractSaveContents = function (contents) {
        // $gameSystem = contents.system;
        // $gameScreen = contents.screen;
        // $gameTimer = contents.timer;
        // $gameSwitches = contents.switches;
        // $gameVariables = contents.variables;
        // $gameSelfSwitches = contents.selfSwitches;
        // $gameActors = contents.actors;
        // $gameParty = contents.party;
        // $gameMap = contents.map;
        // $gamePlayer = contents.player;
        $gameSystem = contents.system;
        $gameScreen = contents.screen;
        $gameTimer = contents.timer;
        $gameSwitches = contents.switches;
        $gameVariables = contents.variables;
        $gameSelfSwitches = contents.selfSwitches;
        $gameActors = contents.actors;
        $gameParty = contents.party;
        $gameMap = contents.map;
        $gamePlayer = contents.player;
        $dataWeapons = contents.weapon;
        $dataArmors = contents.armour;
    };

    //得到物品中对素材的自定义内容
    DataManager.Reinforce.getMaterialInfo = function (item) {
        if (item === null) return null;
        let notes = item.note.split(/[\r\n]+/);
        let itemInfo = new Material();
        let isMaterials = false;
        let isComponent = false;

        let weaponComponentReg = new RegExp('type = ' + PluginPara['weaponComponentTypeName']);
        let weaponMaterialReg = new RegExp('type = ' + PluginPara['weaponMaterialTypeName']);
        let armourElementReg = new RegExp('type = ' + PluginPara['armourElementTypeName']);

        for (let noteIndex = 0; noteIndex < notes.length; noteIndex++) {
            let line = notes[noteIndex];
            if (line.match(/<REINFORCE MATERIAL>/i)) {
                isMaterials = true;
            } else if (line.match(/<\/REINFORCE MATERIAL>/i)) {
                isMaterials = false;
            } else if (isMaterials) {
                if (line.match(/<COMPONENT STATE>/i)) {
                    isComponent = true;
                } else if (line.match(/<\/COMPONENT STATE>/i)) {
                    isComponent = false;
                } else if (isComponent) {
                    if (line.match(/(code\s*=\s*)([0-9]*)/i)) {
                        itemInfo.Traits.code = Number(line.match(/(code\s*=\s*)([0-9]*)/i)[2]);
                    } else if (line.match(/(dataId\s*=\s*)([0-9]*)/i)) {
                        itemInfo.Traits.dataId = Number(line.match(/(dataId\s*=\s*)([0-9]*)/i)[2]);
                    } else if (line.match(/(value\s*=\s*)([0-9]*)/i)) {
                        itemInfo.Traits.value = Number(line.match(/(value\s*=\s*)([0-9]*\.?[0-9]*)/i)[2]);
                    }
                } else if (weaponComponentReg.test(line)) {
                    itemInfo.MaterialType = PluginPara['weaponComponentTypeName'];
                } else if (weaponMaterialReg.test(line)) {
                    itemInfo.MaterialType = PluginPara['weaponMaterialTypeName'];
                } else if (armourElementReg.test(line)) {
                    itemInfo.MaterialType = PluginPara['armourElementTypeName'];
                } else if (line.match(/(multiplier\s*=\s*)([0-9]*\.?[0-9]*)/i)) {
                    itemInfo.MaterialMultiplier = Number(line.match(/(multiplier\s*=\s*)([0-9]*\.?[0-9]*)/i)[2]);
                }
            }
        }
        return itemInfo;
    }

    //得到物品中对武器装备的自定义内容
    DataManager.Reinforce.getCombatItemInfo = function (item, isWeapon) {
        if (item === null) return null;
        let notes = item.note.split(/[\r\n]+/);
        let isMat = false;
        let isCom = false;
        let itemInfo = new CombatItem();
        itemInfo.isWeapon = isWeapon;
        for (let noteIndex = 0; noteIndex < notes.length; noteIndex++) {
            let line = notes[noteIndex];
            if (line.match(/<MATERIAL UPDATE>/i)) {
                isMat = true;
            } else if (line.match(/<\/MATERIAL UPDATE>/i)) {
                isMat = false;
            } else if (line.match(/<COMPONENT UPDATE>/i)) {
                isCom = true;
            } else if (line.match(/<\/COMPONENT UPDATE>/i)) {
                isCom = false;
            } else if (isMat) {
                if (line.match(/(maxTimes\s?=\s?)([0-9]*)/i)) {
                    itemInfo.MaterialUpdate.MaxTimes = line.match(/(maxTimes\s?=\s?)([0-9]*)/i)[2];
                } else if (line.match(/(nowTimes\s?=\s?)([0-9]*)/i)) {
                    itemInfo.MaterialUpdate.NowTimes = line.match(/(nowTimes\s?=\s?)([0-9]*)/i)[2];
                    itemInfo.MaterialUpdate.NowTimeDescIndex = noteIndex;
                }
            } else if (isCom) {
                if (line.match(/(maxTimes\s?=\s?)([0-9]*)/i)) {
                    itemInfo.ComponentUpdate.MaxTimes = line.match(/(maxTimes\s?=\s?)([0-9]*)/i)[2];
                } else if (line.match(/(nowTimes\s?=\s?)([0-9]*)/i)) {
                    itemInfo.ComponentUpdate.NowTimes = line.match(/(nowTimes\s?=\s?)([0-9]*)/i)[2];
                    itemInfo.ComponentUpdate.NowTimeDescIndex = noteIndex;
                }
            }
        }
        return itemInfo;
    }

    //通过深拷贝造一个新的武器/护甲，并返回武器/护甲
    DataManager.Reinforce.DulpulicateCombatItems = function (items, itemInfo) {
        let newItem = JSON.parse(JSON.stringify(items));
        if (itemInfo.isWeapon) {
            newItem.id = $dataWeapons.length;
            $dataWeapons.push(newItem);
        } else {
            newItem.id = $dataArmors.length;
            $dataArmors.push(newItem);
        }
        return newItem;
    }

    //修改武器的特性信息
    DataManager.Reinforce.modifyTraits = function (newCombatItem, traitsInfo) {
        let isModified = false;
        for (let element of newCombatItem.traits) {
            if (element.code === 43 && element.dataId === Number(PluginPara['emptySkill'])) {
                console.log(element);
                element.code = traitsInfo.code;
                element.dataId = traitsInfo.dataId;
                element.value = traitsInfo.value;
                isModified = true;
                break;
            }
        }
        return isModified;
    }

    DataManager.Reinforce.noteWriteBack = function (item, objectName, objectLineIndex, value) {
        let notes = item.note.split(/[\r\n]+/);
        notes[objectLineIndex] = objectName + " = " + value;
        let newNote = notes.join("\n");
        item.note = newNote;
    }

    //根据材料信息升级新复制的武器/护甲
    DataManager.Reinforce.CombatItemIncrease = function (newCombatItem, materialInfo, combatInfo) {
        switch (materialInfo.MaterialType) {
            case PluginPara['weaponComponentTypeName']:
                this.modifyTraits(newCombatItem, materialInfo.Traits);
                combatInfo.ComponentUpdate.NowTimes++;
                this.noteWriteBack(newCombatItem, "NowTimes", combatInfo.ComponentUpdate.NowTimeDescIndex, combatInfo.ComponentUpdate.NowTimes);
                break;
            case PluginPara['weaponMaterialTypeName']:
                newCombatItem.params[2] = Math.round(newCombatItem.params[2] * materialInfo.MaterialMultiplier);
                newCombatItem.params[4] = Math.round(newCombatItem.params[4] * materialInfo.MaterialMultiplier);
                combatInfo.MaterialUpdate.NowTimes++;
                this.noteWriteBack(newCombatItem, "NowTimes", combatInfo.MaterialUpdate.NowTimeDescIndex, combatInfo.MaterialUpdate.NowTimes);
                break;
            case PluginPara['armourElementTypeName']:
                newCombatItem.params[3] = Math.round(newCombatItem.params[3] * materialInfo.MaterialMultiplier);
                newCombatItem.params[5] = Math.round(newCombatItem.params[5] * materialInfo.MaterialMultiplier);
                combatInfo.MaterialUpdate.NowTimes++;
                this.noteWriteBack(newCombatItem, "NowTimes", combatInfo.MaterialUpdate.NowTimeDescIndex, combatInfo.MaterialUpdate.NowTimes);
                break;
        }
    }

    //检查该战斗物品是装备还是武器
    DataManager.Reinforce.isWeaponCheck = function (combatItem) {
        return $dataWeapons[combatItem.id].name === combatItem.name;
    }

    //检查该武器/装备是否还能强化
    DataManager.Reinforce.combatItemCheck = function (combatInfo) {
        return this.ComponentUpdateCheck(combatInfo) || this.MaterialUpdateCheck(combatInfo);
    }

    DataManager.Reinforce.ComponentUpdateCheck = function (combatInfo) {
        if (combatInfo === null) return false;
        return combatInfo.ComponentUpdate.NowTimes < combatInfo.ComponentUpdate.MaxTimes && combatInfo.ComponentUpdate.MaxTimes !== 0;
    }

    DataManager.Reinforce.MaterialUpdateCheck = function (combatInfo) {
        if (combatInfo === null) return false;
        return combatInfo.MaterialUpdate.NowTimes < combatInfo.MaterialUpdate.MaxTimes && combatInfo.MaterialUpdate.MaxTimes !== 0;
    }

    //检查物品是否属于强化物
    DataManager.Reinforce.MaterialCheck = function (item) {
        if (item === null) return false;
        let info = this.getMaterialInfo(item);
        return info.MaterialType === PluginPara['weaponComponentTypeName']
            || info.MaterialType === PluginPara['weaponMaterialTypeName']
            || info.MaterialType === PluginPara['armourElementTypeName'];
    }

    //检查该武器/装备与材料是否匹配
    DataManager.Reinforce.isMatch = function (combatInfo, matType) {
        if (combatInfo.isWeapon) {
            return matType === PluginPara['weaponComponentTypeName'] || matType === PluginPara['weaponMaterialTypeName']
        } else {
            return matType === PluginPara['armourElementTypeName'];
        }
    }

    //检查是否满足强化条件
    DataManager.Reinforce.reinforceCheck = function (combatInfo, matType) {
        if (matType === PluginPara['weaponComponentTypeName']) {
            return this.ComponentUpdateCheck(combatInfo) && this.isMatch(combatInfo, matType);
        } else if (matType === PluginPara['weaponMaterialTypeName'] || matType === PluginPara['armourElementTypeName']) {
            return this.MaterialUpdateCheck(combatInfo) && this.isMatch(combatInfo, matType);
        }
    }

    //更新背包，包含剔除旧物品、增加新物品、删除强化材料
    DataManager.Reinforce.updateBackpack = function (oldItem, newItem, material) {
        $gameParty.loseItem(oldItem, 1, true);
        $gameParty.gainItem(newItem, 1, false);
        $gameParty.loseItem(material, 1);
    }

    //返回背包内可强化装备和武器列表
    DataManager.Reinforce.CombatItemList = function () {
        let CombatItemList = {}
        CombatItemList.weaponList = new Array();
        CombatItemList.armorList = new Array();
        for (const key in $gameParty._weapons) {
            let info = this.getCombatItemInfo($dataWeapons[key], true);
            if (this.combatItemCheck(info)) {
                CombatItemList.weaponList.push($dataWeapons[key]);
            }
        }
        for (const key in $gameParty._armors) {
            let info = this.getCombatItemInfo($dataArmors[key], false);
            if (this.combatItemCheck(info)) {
                CombatItemList.armorList.push($dataArmors[key]);
            }
        }
        // 不需要分开的话直接合并返回一个数组
        return CombatItemList.weaponList.concat(CombatItemList.armorList);
    }

    //返回背包内强化材料列表
    DataManager.Reinforce.MaterialList = function () {
        let MaterialList = new Array();
        for (const key in $gameParty._items) {
            if (this.MaterialCheck($dataItems[key])) {
                MaterialList.push($dataItems[key]);
            }
        }
        return MaterialList;
    }

    //返回在强化界面中选择物品时显示的信息
    DataManager.Reinforce.getItemUserInterfaceInfo = function (item) {
        let lable = new Array();
        if (item === null) return lable;
        if (!this.MaterialCheck(item)) {
            lable.push(item.description);
            let isWeapon = this.isWeaponCheck(item);
            let combatItemInfo = this.getCombatItemInfo(item, isWeapon);

            if (item.params[2] !== 0) lable.push("近身搏斗 : " + item.params[2]);
            if (item.params[4] !== 0) lable.push("远程攻击 : " + item.params[4]);
            if (item.params[3] !== 0) lable.push("招架能力 : " + item.params[3]);
            if (item.params[5] !== 0) lable.push("防弹等级 : " + item.params[5]);

            lable.push(PluginPara['MaterialUpdateLableName'] + "次数 : " + combatItemInfo.MaterialUpdate.NowTimes + " / " + combatItemInfo.MaterialUpdate.MaxTimes);
            if (isWeapon) lable.push(PluginPara['ComponentUpdateLableName'] + "次数 : " + combatItemInfo.ComponentUpdate.NowTimes + " / " + combatItemInfo.ComponentUpdate.MaxTimes);

        } else {
            let matInfo = this.getMaterialInfo(item);

            if (matInfo.MaterialType === PluginPara['weaponComponentTypeName']) {
                lable.push("武器" + PluginPara['ComponentUpdateLableName'] + "配件");
            } else if (matInfo.MaterialType === PluginPara['weaponMaterialTypeName']) {
                lable.push("武器" + PluginPara['MaterialUpdateLableName'] + "材料");
            } else if (matInfo.MaterialType === PluginPara['armourElementTypeName']) {
                lable.push("装备" + PluginPara['MaterialUpdateLableName'] + "材料");
            }

            lable.push(item.description);
        }
        return lable;
    }

    //升级武器/护甲 该函数为强化主要调用函数 并返回强化是否成功
    DataManager.Reinforce.reinforce = function (combatItem, material) {
        let isWeapon = this.isWeaponCheck(combatItem);
        let combatInfo = this.getCombatItemInfo(combatItem, isWeapon);
        let newCombatItem = this.DulpulicateCombatItems(combatItem, combatInfo);
        let materialInfo = this.getMaterialInfo(material);
        let matType = materialInfo.MaterialType;

        let res = {
            flag: true,
            newCombatItem: {}
        }
        if (this.reinforceCheck(combatInfo, matType)) {
            this.CombatItemIncrease(newCombatItem, materialInfo, combatInfo);
            this.updateBackpack(combatItem, newCombatItem, material);
            res.flag = true;
            res.newCombatItem = newCombatItem;
        } else {
            res.msg = "物品或材料未满足强化/改造条件";
            res.flag = false;
        }
        return res;
    }

    //=============================================================================
    //合成界面编写
    function Scene_Reinforce() {
        this.initialize.apply(this, arguments);
    }

    Scene_Reinforce.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_Reinforce.prototype.constructor = Scene_Reinforce;

    Scene_Reinforce.prototype.initialize = function () {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_Reinforce.prototype.create = function () {
        Scene_MenuBase.prototype.create.call(this);
        this.createHelpWindow();
        this.createReinforceSelectWindows();
    };

    Scene_Reinforce.prototype.createReinforceSelectWindows = function () {
        var wx = 0;
        var wy = this._helpWindow.height;
        var ww = Graphics.boxWidth / 2;
        var wh = (Graphics.boxHeight - wy) * 0.7;

        this._descWindow = new Window_Desc(new Rectangle(0, wh + wy, Graphics.boxWidth, Graphics.boxHeight - wh - wy))
        this._descWindow.activate();
        this.addWindow(this._descWindow);

        this._reinforceSelectWindowLeft = new Window_ReinforceSelect(wx, wy, ww, wh, 'left');
        this._reinforceSelectWindowLeft.setHandler("ok", this.onReinforceSelectOk.bind(this));
        this._reinforceSelectWindowLeft.setHandler("select", this.onReinforceSelect.bind(this));
        this._reinforceSelectWindowLeft.setHandler("cancel", this.onReinforceSelectCancel.bind(this));
        this._reinforceSelectWindowLeft.activate();
        this._reinforceSelectWindowLeft.refresh();
        this.addWindow(this._reinforceSelectWindowLeft);

        wx = Graphics.boxWidth / 2;
        ww = Graphics.boxWidth - wx;
        this._reinforceSelectWindowRight = new Window_ReinforceSelect(wx, wy, ww, wh, 'right');
        this._reinforceSelectWindowRight.setHandler("ok", this.onMaterialSelectOk.bind(this));
        this._reinforceSelectWindowRight.setHandler("select", this.onMaterialSelect.bind(this));
        this._reinforceSelectWindowRight.setHandler("cancel", this.onMaterialSelectCancel.bind(this));
        this._reinforceSelectWindowRight.refresh();
        this._reinforceSelectWindowRight.deactivate();
        this.addWindow(this._reinforceSelectWindowRight);
    };
    Scene_Reinforce.prototype.onReinforceSelect = function () {
        if (this._reinforceSelectWindowLeft._index > -1) {
            this._descWindow.setItem(this._reinforceSelectWindowLeft._data[this._reinforceSelectWindowLeft._index])
            this._descWindow.refresh();
        }
    }
    Scene_Reinforce.prototype.onReinforceSelectCancel = function () {
        this.popScene();
    }
    Scene_Reinforce.prototype.onReinforceSelectOk = function () {
        var item = this._reinforceSelectWindowLeft.item();
        if (item) {
            // this._reinforceSelectWindowRight.open();
            this._reinforceSelectWindowRight.activate();
            this._reinforceSelectWindowRight.select(-1);
            this._combatItem = item;
        }
    };

    Scene_Reinforce.prototype.onMaterialSelect = function () {
        if (this._reinforceSelectWindowRight._index > -1) {
            this._descWindow.setItem(this._reinforceSelectWindowRight._data[this._reinforceSelectWindowRight._index])
            this._descWindow.refresh();
        }
    }
    Scene_Reinforce.prototype.onMaterialSelectCancel = function () {
        this._reinforceSelectWindowRight.deactivate();
        this._reinforceSelectWindowRight.select(-1);
        this._reinforceSelectWindowRight.refresh();
        this._reinforceSelectWindowLeft.select(-1);
        this._reinforceSelectWindowLeft.refresh();
        this._reinforceSelectWindowLeft.activate();
    }
    Scene_Reinforce.prototype.onMaterialSelectOk = function () {
        var material = this._reinforceSelectWindowRight.item();
        if (material) {
            var res = DataManager.Reinforce.reinforce(this._combatItem, material, true);
            if (res.flag) {
                //TODO 如果成功应该显示newCombatItem
                this._reinforceResult = res.newCombatItem;
                this._descWindow.setItem(this._reinforceResult);
                this._descWindow.refresh();
                this.onMaterialSelectCancel();
            }
            //TODO  如果失败应该显示提示
            else {
                this.onMaterialSelectCancel();
                this._descWindow.refresh(res.msg)
            }
            console.log(res)
        }
    };


    function Window_ReinforceSelect() {
        this.initialize.apply(this, arguments);
    }

    Window_ReinforceSelect.prototype = Object.create(Window_Selectable.prototype);
    Window_ReinforceSelect.prototype.constructor = Window_ReinforceSelect;

    Window_ReinforceSelect.prototype.initialize = function (x, y, width, height, location) {
        Window_Selectable.prototype.initialize.call(this, new Rectangle(x, y, width, height));
        this.location = location
    };

    Window_ReinforceSelect.prototype.select = function (index) {
        Window_Selectable.prototype.select.call(this, index);
        if (index > -1 && this.active) {
            this.callHandler("select");
        }
    }

    Window_ReinforceSelect.prototype.maxItems = function () {
        return this._data ? this._data.length : 0;
    };

    Window_ReinforceSelect.prototype.item = function () {
        return this._data && this.index() >= 0 ? this._data[this.index()] : null;
    };

    Window_ReinforceSelect.prototype.includes = function (item) {
        return true;
    };

    Window_ReinforceSelect.prototype.isEnabled = function (item) {
        return true;
    };

    Window_ReinforceSelect.prototype.makeItemList = function () {
        if (this.location == 'left') {
            this._data = DataManager.Reinforce.CombatItemList();
        } else {
            this._data = DataManager.Reinforce.MaterialList();
        }
    };

    Window_ReinforceSelect.prototype.refresh = function () {
        if (this.contents) {
            this.contents.clear();
            this.makeItemList();
            for (let i = 0; i < this.maxItems(); i++) {
                const rect = this.itemLineRect(i);
                var item = this._data[i];
                this.drawItem(i);
                this.changePaintOpacity(true);
            }
        }
    }
    Window_ReinforceSelect.prototype.drawItem = function (index) {
        var item = this._data[index];
        var rect = this.itemLineRect(index);
        this.drawIcon(item.iconIndex, rect.x, rect.y);
        this.drawText(item.name, rect.x + ImageManager.iconWidth + 10, rect.y, rect.width);
    };



    function Window_Desc() {
        this.initialize(...arguments);
    }

    Window_Desc.prototype = Object.create(Window_Base.prototype);
    Window_Desc.prototype.constructor = Window_Desc;
    Window_Desc.prototype.initialize = function (rect) {
        Window_Base.prototype.initialize.call(this, rect);
        this.item = null;
        this.refresh();
    };

    Window_Desc.prototype.drawDesc = function () {
        const label = DataManager.Reinforce.getItemUserInterfaceInfo(this.item)
        let x = 5;
        let y = 5;
        let i = 0;
        while (i < label.length) {
            if (x > Graphics.boxWidth) {
                x = 5;
                y += this.lineHeight();
            }
            this.drawText(label[i], x, y, Graphics.boxWidth / 2)
            x += Graphics.boxWidth / 2
            i++;
        }
    };

    Window_Desc.prototype.setItem = function (item) {
        this.item = item
    }

    Window_Desc.prototype.refresh = function (msg) {
        this.contents.clear()
        if (msg) {
            this.drawText(msg, 0, 10, Graphics.boxWidth, "center")
        }
        else if (this.item) {
            this.drawDesc();
        }
    }


    const _Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function () {
        _Window_MenuCommand_addOriginalCommands.call(this);
        this.addCommand('强化', "reinforce", true);
    };

    const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function () {
        _Scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler('reinforce', this.commandReinforce.bind(this));
        this._commandWindow.addCommand('强化', 'reinforce', true);
    };

    Scene_Menu.prototype.commandReinforce = function () {
        SceneManager.push(Scene_Reinforce);
    };

})()