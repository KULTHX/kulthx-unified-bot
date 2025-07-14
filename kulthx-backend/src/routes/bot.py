from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import requests
import json
import os

bot_bp = Blueprint('bot', __name__)

# ملف لحفظ إعدادات البوت
BOT_CONFIG_FILE = os.path.join(os.path.dirname(__file__), '..', 'bot_config.json')

def load_bot_config():
    """تحميل إعدادات البوت من الملف"""
    try:
        if os.path.exists(BOT_CONFIG_FILE):
            with open(BOT_CONFIG_FILE, 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error loading bot config: {e}")
    return {}

def save_bot_config(config):
    """حفظ إعدادات البوت في الملف"""
    try:
        os.makedirs(os.path.dirname(BOT_CONFIG_FILE), exist_ok=True)
        with open(BOT_CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving bot config: {e}")
        return False

@bot_bp.route('/token', methods=['POST'])
@cross_origin()
def update_bot_token():
    """تحديث توكن البوت"""
    try:
        data = request.get_json()
        if not data or 'token' not in data:
            return jsonify({'error': 'Token is required'}), 400
        
        token = data['token'].strip()
        if not token:
            return jsonify({'error': 'Token cannot be empty'}), 400
        
        # التحقق من صحة التوكن (تحقق أساسي من التنسيق)
        if not token.count('.') == 2:
            return jsonify({'error': 'Invalid token format'}), 400
        
        # حفظ التوكن في الملف
        config = load_bot_config()
        config['discord_token'] = token
        config['last_updated'] = str(int(time.time()))
        
        if save_bot_config(config):
            # إشعار البوت بالتوكن الجديد (إذا كان يعمل)
            try:
                # يمكن إضافة آلية إشعار البوت هنا
                pass
            except:
                pass
            
            return jsonify({
                'success': True,
                'message': 'Bot token updated successfully'
            })
        else:
            return jsonify({'error': 'Failed to save token'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bot_bp.route('/status', methods=['GET'])
@cross_origin()
def get_bot_status():
    """الحصول على حالة البوت"""
    try:
        config = load_bot_config()
        
        # محاكاة حالة البوت
        status = {
            'connected': bool(config.get('discord_token')),
            'servers': 1 if config.get('discord_token') else 0,
            'users': 150 if config.get('discord_token') else 0,
            'scripts_protected': 25 if config.get('discord_token') else 0,
            'uptime': '5m' if config.get('discord_token') else '0m',
            'last_updated': config.get('last_updated', '')
        }
        
        return jsonify(status)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bot_bp.route('/config', methods=['GET'])
@cross_origin()
def get_bot_config():
    """الحصول على إعدادات البوت (بدون التوكن)"""
    try:
        config = load_bot_config()
        
        # إرجاع الإعدادات بدون التوكن لأسباب أمنية
        safe_config = {
            'has_token': bool(config.get('discord_token')),
            'last_updated': config.get('last_updated', ''),
            'prefix': config.get('prefix', '!'),
            'max_scripts': config.get('max_scripts', 50)
        }
        
        return jsonify(safe_config)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

import time

