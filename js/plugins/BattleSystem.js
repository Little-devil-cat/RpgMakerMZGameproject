/*
* 修改Tp值获取方式、上限算法
*/
(() => {
    //注释掉受伤影响Tp的功能 rmmz_objects.js/Line 3930
    Game_Battler.prototype.onDamage = function(value) {
        this.removeStatesByDamage();
        //this.chargeTpByDamage(value / this.mhp);
    };

    //每局开始Tp清零 rmmz_objects.js/Line 3850
    Game_Battler.prototype.initTp = function() {
        this.setTp(1);
    };

    //修改回合结束时自动恢复TP为1 rmmz_objects.js/Line 3882
    Game_Battler.prototype.regenerateTp = function() {
        //const value = Math.floor(100 * this.trg);
        //this.gainSilentTp(value);
        this.gainSilentTp(1);
    };

    //修改最大Tp
    Game_BattlerBase.prototype.maxTp = function() {
        return 5;
    };
})()