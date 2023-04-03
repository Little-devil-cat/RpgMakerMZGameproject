/*:
 * @plugindesc 修改剧情对话字体
 * @author Hale Lin
 *
 * @param fontSize
 * @text 剧情对话字体大小
 * @type number
 * @desc 剧情对话字体大小设置，引擎默认为24
 * @default 24
 *
 */
const params_message_font = PluginManager.parameters('MessageFont');

Window_Message.prototype.resetFontSettings = function() {
    Window_Base.prototype.resetFontSettings.call(this);
    this.contents.fontSize = JSON.parse(params_message_font['fontSize']);
};