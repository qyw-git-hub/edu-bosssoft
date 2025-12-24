/**
 * 基于 node-forge 的 AES-GCM 加密工具类
 * 对应 JAVA AesGcmUtil 类
 */
export class AesGcmUtil {
  constructor(secretKey) {
    // 算法参数 (与Java端对齐)
    this.ALGORITHM = 'AES-GCM';
    this.KEY_SIZE = 256; // bits
    this.IV_LENGTH = 12; // bytes
    this.TAG_LENGTH = 16; // bytes (128 bits)
    this.SECRET_KEY = secretKey
  }

  /**
   * 将Base64字符串转换为 forge 使用的字节串
   */
  _base64ToBytes(base64) {
    return forge.util.decode64(base64);
  }

  /**
   * 将字节串转换为Base64字符串
   */
  _bytesToBase64(bytes) {
    return forge.util.encode64(bytes);
  }

  /**
   * 加密字符串
   * @param {string} plaintext - 明文
   * @param {string} base64Key - Base64编码的密钥 (可选，不传则使用实例密钥)
   * @returns {string} Base64编码的加密结果，格式为: IV(12字节) + 密文 + 认证标签(16字节)
   */
  encrypt(plaintext, base64Key = this.SECRET_KEY) {
    try {
      // 1. 准备密钥
      const keyBytes = this._base64ToBytes(base64Key);
      const key = forge.util.createBuffer(keyBytes);
      
      // 2. 生成随机IV
      const iv = forge.random.getBytesSync(this.IV_LENGTH);
      
      // 3. 创建GCM加密器
      const cipher = forge.cipher.createCipher('AES-GCM', key);
      cipher.start({
        iv: iv,
        tagLength: this.TAG_LENGTH * 8 // forge期望位长度
      });
      
      // 4. 更新并完成加密
      cipher.update(forge.util.createBuffer(plaintext, 'utf8'));
      const finished = cipher.finish();
      if (!finished) {
        throw new Error('加密过程未能完成');
      }
      
      // 5. 获取密文和认证标签
      const ciphertext = cipher.output.getBytes();
      const tag = cipher.mode.tag.getBytes();
      
      // 6. 拼接: IV + 密文 + 标签
      const combined = iv + ciphertext + tag;
      
      // 7. 返回Base64
      return this._bytesToBase64(combined);
      
    } catch (error) {
      throw new Error(`加密失败: ${error.message}`);
    }
  }

  /**
   * 解密字符串
   * @param {string} encryptedDataBase64 - Base64编码的加密数据 (IV+密文+标签)
   * @param {string} base64Key - Base64编码的密钥 (可选)
   * @returns {string} 解密后的明文字符串
   */
  decrypt(encryptedDataBase64, base64Key = this.SECRET_KEY) {
    try {
      // 1. 解码Base64
      const combinedBytes = this._base64ToBytes(encryptedDataBase64);
      
      // 2. 分离 IV、密文、标签
      const iv = combinedBytes.substr(0, this.IV_LENGTH);
      const tag = combinedBytes.substr(-this.TAG_LENGTH);
      const ciphertext = combinedBytes.substr(this.IV_LENGTH, combinedBytes.length - this.IV_LENGTH - this.TAG_LENGTH);
      
      // 3. 准备密钥
      const keyBytes = this._base64ToBytes(base64Key);
      const key = forge.util.createBuffer(keyBytes);
      
      // 4. 创建GCM解密器
      const decipher = forge.cipher.createDecipher('AES-GCM', key);
      decipher.start({
        iv: iv,
        tagLength: this.TAG_LENGTH * 8,
        tag: forge.util.createBuffer(tag) // 提供认证标签
      });
      
      // 5. 更新并完成解密
      decipher.update(forge.util.createBuffer(ciphertext));
      const finished = decipher.finish();
      if (!finished) {
        throw new Error('解密失败：认证标签验证未通过或数据损坏');
      }
      
      // 6. 返回解密后的文本
      return decipher.output.toString('utf8');
      
    } catch (error) {
      throw new Error(`解密失败: ${error.message}`);
    }
  }

  /**
   * 生成一个随机的32字节密钥 (Base64编码)
   * @returns {string} Base64编码的密钥
   */
  generateRandomKey() {
    try {
      const randomBytes = forge.random.getBytesSync(32);
      return this._bytesToBase64(randomBytes);
    } catch (error) {
      throw new Error(`生成随机密钥失败: ${error.message}`);
    }
  }

  /**
   * 验证密钥格式是否为有效的AES-256密钥
   * @param {string} base64Key - Base64编码的密钥
   * @returns {boolean} true 如果密钥有效
   */
  isValidKey(base64Key = this.SECRET_KEY) {
    try {
      const keyBytes = this._base64ToBytes(base64Key);
      return keyBytes.length === 32; // 32字节 = 256位
    } catch (error) {
      return false;
    }
  }
}