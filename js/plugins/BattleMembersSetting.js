/*:
 * @plugindesc 战斗人员限制
 * @author Hale Lin
 *
 *
 * @param maxBattleMembers
 * @text 最大战斗人数
 * @type number
 * @desc 默认为4
 * @default 3
 */

(() => {
    const params = PluginManager.parameters('BattleMembersSetting');

    const maxMembers = params['maxBattleMembers']

    Game_Party.prototype.maxBattleMembers = function() {
        return maxMembers ? maxMembers : 4;
    };
})()