/*:
 * @plugindesc 战斗界面增加行动顺序显示条
 * @author Hale Lin
 *
 */

BattleManager.startTurn = function() {
    this._phase = "turn";
    $gameTroop.increaseTurn();
    $gameParty.requestMotionRefresh();
    if (!this.isTpb()) {
        // 让速度计算在回合初进行
        // this.makeActionOrders();
        this._logWindow.startTurn();
        this._inputting = false;
    }
};

BattleManager.startBattle = function() {
    this._phase = "start";
    $gameSystem.onBattleStart();
    $gameParty.onBattleStart(this._preemptive);
    $gameTroop.onBattleStart(this._surprise);
    this.makeActionOrders() // add
    this.displayStartMessages();
};
BattleManager.endTurn = function() {
    this._phase = "turnEnd";
    this._preemptive = false;
    this._surprise = false;
    this.makeActionOrders() // add
};

BattleManager.makeActionOrders = function() {
    const battlers = [];
    if (!this._surprise) {
        battlers.push(...$gameParty.battleMembers());
    }
    if (!this._preemptive) {
        battlers.push(...$gameTroop.members());
    }
    for (const battler of battlers) {
        // battler.makeSpeed();
        if (battler._enemyId) {
            battler._speed = battler.agi * 100
        }
        // 敏捷 * 0.8 ~ 1.2 + 等级 * 0.1
        else {
            battler._speed = battler.agi * Math.floor((Math.random() * 0.4 + 0.8) * 100) + battler._level * 0.1
        }
    }
    battlers.sort((a, b) => b.speed() - a.speed());
    console.log(battlers)
    this._actionBattlers = battlers;
};


function Window_Speed() {
    this.initialize.apply(this, arguments);
}

Window_Speed.prototype = Object.create(Window_Base.prototype);
Window_Speed.prototype.constructor = Window_Speed;

Window_Speed.prototype.initialize = function(rect) {
    Window_Base.prototype.initialize.call(this, rect);
    this._battlersNum = BattleManager._actionBattlers.length;
    this.refresh();
};

//=====================================================================================

function Sprite_myEnemy(enemy) {
    Sprite.call(this);
    this._enemy = enemy;
    this.createMainBitmap();
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
}

Sprite_myEnemy.prototype = Object.create(Sprite.prototype);
Sprite_myEnemy.prototype.constructor = Sprite_myEnemy;

// 加载敌人图像
Sprite_myEnemy.prototype.createMainBitmap = function() {
    var name = this._enemy.battlerName();
    var hue = this._enemy.battlerHue();
    this.bitmap = ImageManager.loadSvEnemy(name, hue);
};

//=====================================================================================

function Sprite_myActor(actor) {
    Sprite.call(this);
    this._actor = actor;
    this.createMainBitmap();
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
}

Sprite_myActor.prototype = Object.create(Sprite.prototype);
Sprite_myActor.prototype.constructor = Sprite_myActor;

// 加载友军图像
Sprite_myActor.prototype.createMainBitmap = function() {
    var name = this._actor._faceName;
    this.bitmap = ImageManager.loadFace(name);
};


Window_Speed.prototype.refresh = function() {
    if (this._innerChildren.length !== BattleManager._actionBattlers.length) {
        if (this._innerChildren.length > BattleManager._actionBattlers.length) {
            var children = this._innerChildren;
            for (var i = 0; i < children.length; i++) {
                this._innerChildren.shift(i).destroy();
            }
        }

        let x = 50;
        let y;
        for (const actionBattler of BattleManager._actionBattlers) {
            if (actionBattler._actorId) {
                y = 80;
                let spriteActor = new Sprite_myActor(actionBattler)
                spriteActor.x = x;
                spriteActor.y = y;
                spriteActor.setFrame(0,0,spriteActor.width / 4, spriteActor.height / 2)
                spriteActor.scale.x = 0.2;
                spriteActor.scale.y = 0.2;
                this.addInnerChild(spriteActor);
            }
            else {
                y = 30;
                let spriteEnemy = new Sprite_myEnemy(actionBattler)
                spriteEnemy.x = x;
                spriteEnemy.y = y;
                spriteEnemy.scale.x = 0.2;
                spriteEnemy.scale.y = 0.2;
                this.addInnerChild(spriteEnemy);
            }
            console.log(BattleManager._actionBattlers, this._innerChildren)
            // if (actionBattler._states.indexOf(1) > 0) {
            //     this.drawText("dead", x, y + 10, this.contentsWidth(), 'center');
            // }
            x += 50;
        }
    }

};

Scene_Battle._speedWindow = null

Scene_Battle.prototype.createAllWindows = function() {
    this.createLogWindow();
    this.createStatusWindow();
    this.createPartyCommandWindow();
    this.createActorCommandWindow();
    this.createHelpWindow();
    this.createSkillWindow();
    this.createItemWindow();
    this.createActorWindow();
    this.createEnemyWindow();
    this.createSpeedWindow(); // 创建速度窗口
    Scene_Message.prototype.createAllWindows.call(this);
};

Scene_Battle.prototype.createSpeedWindow = function() {
    this._speedWindow = new Window_Speed(new Rectangle( Graphics.boxWidth * 2 / 3, 10, Graphics.boxWidth / 3, Graphics.boxHeight / 5));
    this.addWindow(this._speedWindow);
};

var old_Scene_Battle_update = Scene_Battle.prototype.update


Scene_Battle.prototype.update = function () {
    old_Scene_Battle_update.call(this)
    if (this._speedWindow) {
        this._speedWindow.refresh();
    }
}
