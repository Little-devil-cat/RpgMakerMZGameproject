/*:
 * @plugindesc 物品自定义功能
 * @author EskiNott
 *
 * @help
 * =>插件使用初始化
 * 请在技能栏6号技能处添加一个空的无效技能用于占位，并在能够自定义的武器和装备中添加该技能，技能数量为附加状态\技能槽位
 * 
 * =>为强化素材添加类型
 * 在注释中写入以下内容
 * <REINFORCE MATERIAL>
 * type = 强化素材类型，该行填入的关键字在插件参数中可自定义
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
 * @param weaponAtkMultiplier
 * @text 武器强化伤害提升倍率
 * @type number
 * @desc 用于定义武器强化一次后物理攻击力和魔法攻击力变化
 * @default 1.4
 * 
 * @param armourDefMultiplier
 * @text 护甲强化防御提升倍率
 * @type number
 * @desc 用于定义护甲强化一次后物理防御力和魔法防御力变化
 * @default 1.2
 */
(() => {
    PluginPara = PluginManager.parameters('WeaponReinforce');
    WeaponAtkMultiplier = PluginPara['weaponAtkMultiplier'];
    ArmourDefMultiplier = PluginPara['armourDefMultiplier'];

    DataManager.WeaponReinforce = {
        MaterialType : new Array(),
        CombatItemMaterialUpdateTime : {
            MaxTimes : new Array(),
            MinTimes : new Array
        },
        CombatItemComponentUpdateTime : {
            MaxTimes : new Array(),
            MinTimes : new Array()
        }
    }

    //得到物品中对素材的自定义内容
    DataManager.WeaponReinforce.getMaterials = function(group){
        for (let GroupIndex = 1; GroupIndex < group.length; GroupIndex++){
            let obj = group[GroupIndex];
            let notes = obj.note.split(/[\r\n]+/);
            let isMaterials = false;
            for (let noteIndex = 0; noteIndex < notes.length; noteIndex++)
            {
                let line = notes[noteIndex];
                if(line.match(/<REINFORCE MATERIAL>/i)){
                    isMaterials = true;
                }else if(line.match(/<\/REINFORCE MATERIAL>/i)){
                    isMaterials = false;
                }else if(isMaterials){
                    if(line.match("type\s?=\s?" + PluginPara['weaponComponentTypeName']+ "/i")){
                        this.MaterialType[GroupIndex] = PluginPara['weaponComponentTypeName'];
                    }else if(line.match("/type\s?=\s?" + PluginPara['weaponMaterialTypeName']+ "/i")){
                        this.MaterialType[GroupIndex] = PluginPara['weaponMaterialTypeName'];
                    }else if(line.match("/type\s?=\s?" + PluginPara['armourElementTypeName'] + "/i")){
                        this.MaterialType[GroupIndex] = PluginPara['armourElementTypeName'];
                    }
                }
            }
        }
        console.log(this.MaterialType);
    }

    //得到物品中对武器装备的自定义内容
    DataManager.WeaponReinforce.getCombatItems = function(group){
        for (let GroupIndex = 1; GroupIndex < group.length; GroupIndex++){
            let obj = group[GroupIndex];
            let notes = obj.note.split(/[\r\n]+/);
            let isUpdate = false;
            for (let noteIndex = 0; noteIndex < notes.length; noteIndex++)
            {
                let line = notes[noteIndex];
                if(line.match(/<MATERIAL UPDATE>/i)){
                    isUpdate = true;
                }else if(line.match(/<\/MATERIAL UPDATE>/i)){
                    isUpdate = false;
                }else if(isUpdate){
                    if(line.match(/(maxTimes\s?=\s?)([0-9]*)/i)){
                        this.CombatItemUpdateTime.MaxTimes[GroupIndex] = line.match(/(maxTimes\s?=\s?)([0-9]*)/i)[2];
                    }else if(line.match(/(nowTimes\s?=\s?)([0-9]*)/i)){
                        this.CombatItemUpdateTime.MinTimes[GroupIndex] = line.match(/(nowTimes\s?=\s?)([0-9]*)/i)[2];
                    }
                }
            }
        }
        console.log(this.CombatItemUpdateTime);
    }

    //通过深拷贝造一个新的，升级后的武器/护甲，并返回武器/护甲ID
    DataManager.WeaponReinforce.DulpulicateCombatItems = function(items){
        let newItem = JSON.parse(JSON.stringify(items));

    }
})()