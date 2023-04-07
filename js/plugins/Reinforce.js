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
 * minTimes = 0
 * </COMPONENT UPDATE>
 * 
 * @param weaponComponentTypeName
 * @text 武器强化配件变量名称
 * @type string
 * @desc 用于定义武器强化配件变量名称
 * @default weaponComponent
 * 
 * @param emptySkillIndex
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

    DataManager.Reinforce = {
        CombatItem : {
            isWeapon : Boolean,
            MaterialUpdateTime : {
                MaxTimes : Number,
                MinTimes : Number
            },
            ComponentUpdateTime : {
                MaxTimes : Number,
                MinTimes : Number
            }
        },
        Material : {
            MaterialType : String,
            MaterialMultiplier : Number,
            Traits : {
                code : Number,
                dataId : Number,
                value : Number
            }
        }
    }

    //得到物品中对素材的自定义内容
    DataManager.Reinforce.getMaterialInfo = function(item){
        let notes = item.note.split(/[\r\n]+/);
        let itemInfo = new this.Reinforce.Material();
        let isMaterials = false;
        let isComponent = false;
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
                    if(line.match(/(code\s?=\s?)([0-9]*)/i)){
                        itemInfo.Traits.code = line.match(/(code\s?=\s?)([0-9]*)/i)[2];
                    }else if(line.match(/(dataId\s?=\s?)([0-9]*)/i)){
                        itemInfo.Traits.dataId = line.match(/(dataId\s?=\s?)([0-9]*)/i)[2];
                    }else if(line.match(/(value\s?=\s?)([0-9]*)/i)){
                        itemInfo.Traits.value = line.match(/(value\s?=\s?)([0-9]*)/i)[2];
                    }
                }else if(line.match("type\s?=\s?" + PluginPara['weaponComponentTypeName']+ "/i")){
                    itemInfo.MaterialType = PluginPara['weaponComponentTypeName'];
                }else if(line.match("/type\s?=\s?" + PluginPara['weaponMaterialTypeName']+ "/i")){
                    itemInfo.MaterialType = PluginPara['weaponMaterialTypeName'];
                }else if(line.match("/type\s?=\s?" + PluginPara['armourElementTypeName'] + "/i")){
                    itemInfo.MaterialType = PluginPara['armourElementTypeName'];
                }
            }
        }
        console.log(itemInfo.MaterialType);
        return itemInfo;
    }

    //得到物品中对武器装备的自定义内容
    DataManager.Reinforce.getCombatItemInfo = function(item, isWeapon){
        let notes = item.note.split(/[\r\n]+/);
        let isMat = false;
        let itemInfo = new this.Reinforce.CombatItem();
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
                    itemInfo.MaterialUpdateTime.MaxTimes = line.match(/(maxTimes\s?=\s?)([0-9]*)/i)[2];
                }else if(line.match(/(nowTimes\s?=\s?)([0-9]*)/i)){
                    itemInfo.MaterialUpdateTime.MinTimes = line.match(/(nowTimes\s?=\s?)([0-9]*)/i)[2];
                }
            }else if(isCom){
                if(line.match(/(maxTimes\s?=\s?)([0-9]*)/i)){
                    itemInfo.ComponentUpdateTime.MaxTimes = line.match(/(maxTimes\s?=\s?)([0-9]*)/i)[2];
                }else if(line.match(/(nowTimes\s?=\s?)([0-9]*)/i)){
                    itemInfo.ComponentUpdateTime.MinTimes = line.match(/(nowTimes\s?=\s?)([0-9]*)/i)[2];
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
            if(element.code === PluginPara['emptySkillIndex']){
                element.code = traitsInfo.code;
                element.dataId = traitsInfo.dataId;
                element.value = traitsInfo.value;
                isModified = true;
            }
        }
        return isModified;
    }

    //根据材料信息升级新复制的武器/护甲
    DataManager.Reinforce.CombatItemIncrease = function(newCombatItem, materialInfo){
        switch(materialInfo.MaterialType){
            case PluginPara['weaponComponentTypeName']:
                this.modifyTraits(newCombatItem, materialInfo);
                break;
            case PluginPara['weaponMaterialTypeName']:
                newCombatItem.params[2] *= materialInfo.MaterialMultiplier;
                newCombatItem.params[4] *= materialInfo.MaterialMultiplier;
                break;
            case PluginPara['armourElementTypeName']:
                newCombatItem.params[3] *= materialInfo.MaterialMultiplier;
                newCombatItem.params[5] *= materialInfo.MaterialMultiplier;
                break;
        }
    }

    //升级武器/护甲
    DataManager.Reinforce.reinforce = function(combatItem, material, isWeapon){
        let combatInfo = this.getCombatItemInfo(combatItem, isWeapon);
        let newCombatItem = this.DulpulicateCombatItems(combatItem, combatInfo);
        let materialInfo = this.getMaterialInfo(material);

        if(combatInfo.isWeapon && (materialInfo === PluginPara['weaponComponentTypeName'] || materialInfo === PluginPara['weaponMaterialTypeName'])
        || (!combatInfo.isWeapon && (materialInfo === PluginPara['armourElementTypeName']))){
            this.CombatItemIncrease(newCombatItem, materialInfo);
        }else{
            console.log("物品和材料不匹配");
        }
    }
})()