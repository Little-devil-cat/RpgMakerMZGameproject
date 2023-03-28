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

    //修改最大Tp rmmz_object.js/Line 3044
    Game_BattlerBase.prototype.maxTp = function() {
        //return 100;
        return 10;
    }; 

    //技能/物品范围条件：存活友方，但不包括使用者
    //15代表数量为单体，16代表数量为全体
    //要使用这两个条件，需要在/data/Skills.json中修改某一条目技能的scope项
    Game_Action.prototype.isForFriend = function() {
        return this.checkItemScope([7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    };

    Game_Action.prototype.isForAliveFriend = function() {
        //return this.checkItemScope([7, 8, 11, 14]);
        return this.checkItemScope([7, 8, 11, 14, 15, 16]);
    };

    //修改单体目标判断
    Game_Action.prototype.isForOne = function() {
        //return this.checkItemScope([1, 3, 7, 9, 11, 12]);
        return this.checkItemScope([1, 3, 7, 9, 11, 12, 15]);
    };

    //修改友方目标判断
    Game_Action.prototype.targetsForFriends = function() {
        const unit = this.friendsUnit();
        if (this.isForUser()) {
            return [this.subject()];
        } else if (this.isForDeadFriend()) {
            return this.targetsForDead(unit);
        } else if (this.isForAliveFriend()) {
            return this.targetsForAlive(unit);
        } else {
            return this.targetsForDeadAndAlive(unit);
        }
    };

    //修改存活目标判断
    Game_Action.prototype.targetsForAlive = function(unit) {
        // if (this.isForOne()) {
        //     if (this._targetIndex < 0) {
        //         return [unit.randomTarget()];
        //     } else {
        //         return [unit.smoothTarget(this._targetIndex)];
        //     }
        // } else {
        //     return unit.aliveMembers();
        // }
        if (this.isForOne()) {
            if(this.isExcludeUser()){
                return [unit.smoothTargetExcludeUser(this._targetIndex)];
            }
            if (this._targetIndex < 0) {
                return [unit.randomTarget()];
            }  else {
                return [unit.smoothTarget(this._targetIndex)];
            }
        } else {
            if(this.isExcludeUser()){
                return unit.aliveMembersExcludeUser();
            } else {
                return unit.aliveMembers();     
            }
        }
    };
    
    //是否不包含使用者
    Game_Action.prototype.isExcludeUser = function(){
        return this.checkItemScope([15, 16]);
    }

    Game_Unit.prototype.smoothTargetExcludeUser = function(index) {
        const member = this.members()[Math.max(0, index)];
        if(member && member.isAlive()){
            if(Game_Action.prototype.subject() === member){
                const alivemembers = this.aliveMembers();
                for (let i = 0; i < alivemembers.length; i++) {
                    if (alivemembers[i] !== this.subject()) {
                        return alivemembers[i];
                    }
                }
            }
            return member;
        }else{
            return this.aliveMembers()[0];
        }
    };

    Game_Unit.prototype.aliveMembersExcludeUser = function() {
        const user = this.subject();
        return this.members().filter(member => member.isAlive()).filter(member => member !== user);
    };
})()