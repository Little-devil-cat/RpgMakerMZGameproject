/*:
 * @plugindesc 物品自定义功能
 * @author EskiNott
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
 */
(() => {
    PluginPara = PluginManager.parameters('Reinforce');
    DataManager.Reinforce = {}
    
    class CombatItem {
        isWeapon = true;
        MaterialUpdate = {
            MaxTimes : 0,
            NowTimes : 0,
            NowTimeDescIndex : 0
        }
        ComponentUpdate = {
            MaxTimes : 0,
            NowTimes : 0,
            NowTimeDescIndex : 0
        }
    }

    class Material {
        MaterialType = "";
        MaterialMultiplier = 1;
        Traits = {
            code : 0,
            dataId : 0,
            value : 0
        }
    }

    //修改存档逻辑
    DataManager.makeSaveContents = function(){
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

    DataManager.extractSaveContents = function(contents) {
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
    DataManager.Reinforce.getMaterialInfo = function(item){
        if(item === null) return null;
        let notes = item.note.split(/[\r\n]+/);
        let itemInfo = new Material();
        let isMaterials = false;
        let isComponent = false;

        let weaponComponentReg = new RegExp('type = ' + PluginPara['weaponComponentTypeName']);
        let weaponMaterialReg = new RegExp('type = ' + PluginPara['weaponMaterialTypeName']);
        let armourElementReg = new RegExp('type = ' + PluginPara['armourElementTypeName']);

        for (let noteIndex = 0; noteIndex < notes.length; noteIndex++)
        {
            let line = notes[noteIndex];
            if(line.match(/<REINFORCE MATERIAL>/i)){
                isMaterials = true;
            }else if(line.match(/<\/REINFORCE MATERIAL>/i)){
                isMaterials = false;
            }else if(isMaterials){
                if(line.match(/<COMPONENT STATE>/i)){
                    isComponent = true;
                }else if(line.match(/<\/COMPONENT STATE>/i)){
                    isComponent = false;
                }else if(isComponent){
                    if(line.match(/(code\s*=\s*)([0-9]*)/i)){
                        itemInfo.Traits.code = Number(line.match(/(code\s*=\s*)([0-9]*)/i)[2]);
                    }else if(line.match(/(dataId\s*=\s*)([0-9]*)/i)){
                        itemInfo.Traits.dataId = Number(line.match(/(dataId\s*=\s*)([0-9]*)/i)[2]);
                    }else if(line.match(/(value\s*=\s*)([0-9]*)/i)){
                        itemInfo.Traits.value = Number(line.match(/(value\s*=\s*)([0-9]*)/i)[2]);
                    }
                }else if(weaponComponentReg.test(line)){
                    itemInfo.MaterialType = PluginPara['weaponComponentTypeName'];
                }else if(weaponMaterialReg.test(line)){
                    itemInfo.MaterialType = PluginPara['weaponMaterialTypeName'];
                }else if(armourElementReg.test(line)){
                    itemInfo.MaterialType = PluginPara['armourElementTypeName'];
                }
            }
        }
        return itemInfo;
    }

    //得到物品中对武器装备的自定义内容
    DataManager.Reinforce.getCombatItemInfo = function(item, isWeapon){
        if(item === null) return null;
        let notes = item.note.split(/[\r\n]+/);
        let isMat = false;
        let isCom = false;
        let itemInfo = new CombatItem();
        itemInfo.isWeapon = isWeapon;
        for (let noteIndex = 0; noteIndex < notes.length; noteIndex++)
        {
            let line = notes[noteIndex];
            if(line.match(/<MATERIAL UPDATE>/i)){
                isMat = true;
            }else if(line.match(/<\/MATERIAL UPDATE>/i)){
                isMat = false;
            }else if(line.match(/<COMPONENT UPDATE>/i)){
                isCom = true;
            }else if(line.match(/<\/COMPONENT UPDATE>/i)){
                isCom = false;
            }else if(isMat){
                if(line.match(/(maxTimes\s?=\s?)([0-9]*)/i)){
                    itemInfo.MaterialUpdate.MaxTimes = line.match(/(maxTimes\s?=\s?)([0-9]*)/i)[2];
                }else if(line.match(/(nowTimes\s?=\s?)([0-9]*)/i)){
                    itemInfo.MaterialUpdate.NowTimes = line.match(/(nowTimes\s?=\s?)([0-9]*)/i)[2];
                    itemInfo.MaterialUpdate.NowTimeDescIndex = noteIndex;
                }
            }else if(isCom){
                if(line.match(/(maxTimes\s?=\s?)([0-9]*)/i)){
                    itemInfo.ComponentUpdate.MaxTimes = line.match(/(maxTimes\s?=\s?)([0-9]*)/i)[2];
                }else if(line.match(/(nowTimes\s?=\s?)([0-9]*)/i)){
                    itemInfo.ComponentUpdate.NowTimes = line.match(/(nowTimes\s?=\s?)([0-9]*)/i)[2];
                    itemInfo.ComponentUpdate.NowTimeDescIndex = noteIndex;
                }
            }
        }
        return itemInfo;
    }

    //通过深拷贝造一个新的武器/护甲，并返回武器/护甲
    DataManager.Reinforce.DulpulicateCombatItems = function(items, itemInfo){
        let newItem = JSON.parse(JSON.stringify(items));
        if(itemInfo.isWeapon){
            $dataWeapons.push(newItem);
        }else{
            $dataArmors.push(newItem);
        }
        return newItem;
    }

    //修改武器的特性信息
    DataManager.Reinforce.modifyTraits = function(newCombatItem, traitsInfo){
        let isModified = false;
        for(let element of newCombatItem.traits){
            if(element.code === 43 && element.dataId === Number(PluginPara['emptySkill'])){
                element.code = traitsInfo.code;
                element.dataId = traitsInfo.dataId;
                element.value = traitsInfo.value;
                isModified = true;
                break;
            }
        }
        return isModified;
    }

    DataManager.Reinforce.noteWriteBack = function(item, objectName, objectLineIndex, value){
        let notes = item.note.split(/[\r\n]+/);
        notes[objectLineIndex] = objectName + " = " + value;
        let newNote = notes.join("\n");
        item.note = newNote;
    }

    //根据材料信息升级新复制的武器/护甲
    DataManager.Reinforce.CombatItemIncrease = function(newCombatItem, materialInfo, combatInfo){
        switch(materialInfo.MaterialType){
            case PluginPara['weaponComponentTypeName']:
                this.modifyTraits(newCombatItem, materialInfo.Traits);
                combatInfo.ComponentUpdate.NowTimes++;
                this.noteWriteBack(newCombatItem, "NowTimes", combatInfo.ComponentUpdate.NowTimeDescIndex, combatInfo.ComponentUpdate.NowTimes);
                break;
            case PluginPara['weaponMaterialTypeName']:
                newCombatItem.params[2] *= materialInfo.MaterialMultiplier;
                newCombatItem.params[4] *= materialInfo.MaterialMultiplier;
                combatInfo.MaterialUpdate.NowTimes++;
                this.noteWriteBack(newCombatItem, "NowTimes", combatInfo.MaterialUpdate.NowTimeDescIndex, combatInfo.MaterialUpdate.NowTimes);
                break;
            case PluginPara['armourElementTypeName']:
                newCombatItem.params[3] *= materialInfo.MaterialMultiplier;
                newCombatItem.params[5] *= materialInfo.MaterialMultiplier;
                combatInfo.MaterialUpdate.NowTimes++;
                this.noteWriteBack(newCombatItem, "NowTimes", combatInfo.MaterialUpdate.NowTimeDescIndex, combatInfo.MaterialUpdate.NowTimes);
                break;
        }
    }

    //检查该武器/装备是否还能强化
    DataManager.Reinforce.combatItemCheck = function(combatInfo){
        if(combatInfo === null) return false;
        return combatInfo.ComponentUpdate.NowTimes < combatInfo.ComponentUpdate.MaxTimes && combatInfo.ComponentUpdate.MaxTimes !== 0
        || combatInfo.MaterialUpdate.NowTimes < combatInfo.MaterialUpdate.MaxTimes && combatInfo.MaterialUpdate.MaxTimes !== 0;
    }

    //检查物品是否属于强化物
    DataManager.Reinforce.MaterialCheck = function(item){
        if(item === null) return false;
        let info = this.getMaterialInfo(item);
        return info.MaterialType === PluginPara['weaponComponentTypeName'] 
            || info.MaterialType === PluginPara['weaponMaterialTypeName']
            || info.MaterialType === PluginPara['armourElementTypeName'];
    }

    //检查该武器/装备与材料是否匹配
    DataManager.Reinforce.isMatch = function(combatInfo, matType){
        if(combatInfo.isWeapon){
            return matType === PluginPara['weaponComponentTypeName'] || matType === PluginPara['weaponMaterialTypeName']
        }else{
            return matType === PluginPara['armourElementTypeName'];
        }
    }
    
    //检查是否满足强化条件
    DataManager.Reinforce.reinforceCheck = function(combatInfo, matType){
        return this.combatItemCheck(combatInfo) && this.isMatch(combatInfo, matType);
    }

    //更新背包，包含剔除旧物品、增加新物品、删除强化材料
    DataManager.Reinforce.updateBackpack = function(oldItem, newItem, material){
        $gameParty.loseItem(oldItem, 1, true);
        $gameParty.gainItem(newItem, 1, false);
        $gameParty.loseItem(material, 1);
    }

    //返回可强化装备和武器列表
    DataManager.Reinforce.CombatItemList = function(){
        let CombatItemList = {}
        CombatItemList.weaponList = new Array();
        CombatItemList.armorList = new Array();
        for(const key in $gameParty._weapons){
            let info = this.getCombatItemInfo($dataWeapons[key], true);
            if(this.combatItemCheck(info)){
                CombatItemList.weaponList.push($dataWeapons[key]);
            }
        }
        for(const key in $gameParty._armors){
            let info = this.getCombatItemInfo($dataArmors[key], false);
            if(this.combatItemCheck(info)){
                CombatItemList.armorList.push($dataArmors[key]);
            }
        }
        return CombatItemList;
    }

    //返回强化材料列表
    DataManager.Reinforce.MaterialList = function(){
        let MaterialList = new Array();
        for(const key in $gameParty._items){
            if(this.MaterialCheck($dataItems[key])){
                MaterialList.push($dataItems[key]);
            }
        }
        return MaterialList;
    }

    //升级武器/护甲 该函数为强化主要调用函数 并返回强化是否成功
    DataManager.Reinforce.reinforce = function(combatItem, material, isWeapon){
        let combatInfo = this.getCombatItemInfo(combatItem, isWeapon);
        let newCombatItem = this.DulpulicateCombatItems(combatItem, combatInfo);
        let materialInfo = this.getMaterialInfo(material);
        let matType = materialInfo.MaterialType;

        if(this.reinforceCheck(combatInfo, matType)){
            this.CombatItemIncrease(newCombatItem, materialInfo, combatInfo);
            this.updateBackpack(combatItem, newCombatItem, isWeapon, material);
            return true;
        }else{
            console.log("物品或材料未满足强化条件");
            return false;
        }
    }
})()