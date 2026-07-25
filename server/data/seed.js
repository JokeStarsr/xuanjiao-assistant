const bcrypt = require('bcryptjs');
const { getDb } = require('../src/db');

const db = getDb();

// 清空旧数据
db.exec('DELETE FROM translation_history');
db.exec('DELETE FROM messages');
db.exec('DELETE FROM tips');
db.exec('DELETE FROM testimonies');
db.exec('DELETE FROM missions');
db.exec('DELETE FROM users');

// 插入种子用户
const seedUsers = [
  { username: 'admin', email: 'admin@mission.org', password: bcrypt.hashSync('Admin123!', 10), church: '北京恩典教会', bio: '系统管理员', is_worker: 1 },
  { username: 'zhangsan', email: 'zhangsan@mission.org', password: bcrypt.hashSync('Test1234!', 10), church: '上海光明教会', bio: '宣教志愿者', is_worker: 1 },
  { username: 'lisi', email: 'lisi@mission.org', password: bcrypt.hashSync('Test1234!', 10), church: '广州恩典教会', bio: '对宣教感兴趣', is_worker: 0 },
  { username: 'wangwu', email: 'wangwu@mission.org', password: bcrypt.hashSync('Test1234!', 10), church: '成都圣爱教会', bio: '宣教士', is_worker: 1 },
];

const insertUser = db.prepare(
  'INSERT INTO users (username, email, password, church, bio, is_worker) VALUES (?, ?, ?, ?, ?, ?)'
);
for (const u of seedUsers) {
  insertUser.run(u.username, u.email, u.password, u.church, u.bio, u.is_worker);
}

// 插入种子宣教地
const seedMissions = [
  {
    name: '曼谷', country: '泰国', region: '东南亚',
    latitude: 13.7563, longitude: 100.5018,
    population: '约830万', religion: '佛教为主（约93%），基督教约1.2%',
    language: '泰语',
    description: '曼谷是泰国的首都和最大城市，也是东南亚重要的宣教区域。泰国以佛教文化为主，基督教群体较小，但近年来福音工作持续增长。城市中有多个国际教会和华人教会，为宣教工作提供了良好的基础。',
    image_url: '',
    culture: '泰国是佛教国家，民众普遍尊重佛教文化与习俗。泰国人注重礼貌，见面行合十礼。王室在泰国文化中地位崇高，不可妄加评论。食物以酸辣为主，街头小吃丰富。',
    embassy_info: JSON.stringify({
      name: '中国驻泰国大使馆',
      address: '57 Ratchadaphisek Road, Din Daeng, Bangkok 10400',
      phone: '+66-2-245-0088',
      consular_hotline: '+66-2-245-7010',
      hours: '周一至周五 9:00-12:00, 14:00-17:00'
    })
  },
  {
    name: '金边', country: '柬埔寨', region: '东南亚',
    latitude: 11.5564, longitude: 104.9282,
    population: '约220万', religion: '佛教为主（约97%），基督教约2%',
    language: '高棉语',
    description: '金边是柬埔寨的首都，近年来基督教在此地有显著增长。许多宣教机构在此开展教育、医疗和社区发展项目。当地华人教会也在积极拓展福音事工。',
    image_url: '',
    culture: '柬埔寨以佛教为国教，寺庙遍布全国。高棉文化历史悠久，吴哥窟是文化象征。民众友善温和，但经历了战争创伤，需要福音的医治与安慰。',
    embassy_info: JSON.stringify({
      name: '中国驻柬埔寨大使馆',
      address: 'No.156, Mao Tse Toung Blvd, Phnom Penh',
      phone: '+855-23-720920',
      consular_hotline: '+855-12-901923',
      hours: '周一至周五 8:30-11:30, 14:30-17:00'
    })
  },
  {
    name: '内罗毕', country: '肯尼亚', region: '非洲',
    latitude: -1.2921, longitude: 36.8219,
    population: '约440万', religion: '基督教约83%，伊斯兰教约11%',
    language: '斯瓦希里语、英语',
    description: '内罗毕是肯尼亚的首都，也是东非的经济和文化中心。基督教在肯尼亚占主导地位，但仍有许多社区需要更深入的福音牧养。城市中有许多国际宣教机构的总部。',
    image_url: '',
    culture: '肯尼亚以基督教为主，教会文化浓厚。斯瓦希里语是东非通用语言。当地人以热情好客著称，音乐和舞蹈是日常生活的重要组成部分。',
    embassy_info: JSON.stringify({
      name: '中国驻肯尼亚大使馆',
      address: 'Woodlands Road, Kilimani, Nairobi',
      phone: '+254-20-2272844',
      consular_hotline: '+254-719-235543',
      hours: '周一至周五 8:30-12:00, 14:30-17:00'
    })
  },
  {
    name: '伊斯兰堡', country: '巴基斯坦', region: '南亚',
    latitude: 33.6844, longitude: 73.0479,
    population: '约120万', religion: '伊斯兰教为主（约96%），基督教约1.6%',
    language: '乌尔都语、英语',
    description: '伊斯兰堡是巴基斯坦的首都，是一个以伊斯兰教为主的国家。基督教群体虽然规模较小，但信仰坚定。宣教工作需要极大的智慧和耐心，以尊重当地文化的方式进行。',
    image_url: '',
    culture: '巴基斯坦是伊斯兰国家，宗教文化深厚。严格遵守伊斯兰教法，女性需注意着装得体。当地人以好客著称，但宗教信仰话题需谨慎对待。',
    embassy_info: JSON.stringify({
      name: '中国驻巴基斯坦大使馆',
      address: 'Diplomatic Enclave, Ramna 4, Islamabad',
      phone: '+92-51-8355016',
      consular_hotline: '+92-315-7277797',
      hours: '周一至周五 9:00-12:00, 14:00-17:00'
    })
  },
  {
    name: '迪拜', country: '阿联酋', region: '中东',
    latitude: 25.2048, longitude: 55.2708,
    population: '约330万', religion: '伊斯兰教为国教，基督教约13%（主要为外籍人士）',
    language: '阿拉伯语、英语',
    description: '迪拜是阿联酋最大的城市，也是中东地区的国际枢纽。这里聚集了大量来自世界各地的外籍人士，形成了多元的宗教环境。许多国际教会在迪拜聚会，为中东宣教提供了独特的平台。',
    image_url: '',
    culture: '阿联酋是伊斯兰国家，但较为开放包容。公共场合需遵守当地着装规范，斋月期间白天禁食禁饮。尊重伊斯兰文化是宣教工作的基本前提。',
    embassy_info: JSON.stringify({
      name: '中国驻阿联酋大使馆',
      address: 'Plot 26, Sector W-22, Al Bahia, Abu Dhabi',
      phone: '+971-2-4434276',
      consular_hotline: '+971-50-4176589',
      hours: '周一至周五 9:00-12:00, 14:00-17:00'
    })
  },
  {
    name: '首尔', country: '韩国', region: '东亚',
    latitude: 37.5665, longitude: 126.9780,
    population: '约970万', religion: '基督教约29%，佛教约23%',
    language: '韩语',
    description: '首尔是韩国的首都，基督教在韩国非常兴盛，拥有世界上最大的教会之一。韩国教会以宣教热情著称，是全球第二大宣教士派遣国。首尔有许多神学院和宣教机构。',
    image_url: '',
    culture: '韩国文化融合了儒家传统和现代元素。基督教在韩国社会有重要影响力，圣诞节是法定假日。韩国的敬拜赞美文化在全球华人教会中影响深远。',
    embassy_info: JSON.stringify({
      name: '中国驻韩国大使馆',
      address: '27 Myeongdong 2-gil, Jung-gu, Seoul',
      phone: '+82-2-738-1038',
      consular_hotline: '+82-10-9724-9110',
      hours: '周一至周五 9:00-12:00, 13:30-17:00'
    })
  },
  {
    name: '东京', country: '日本', region: '东亚',
    latitude: 35.6762, longitude: 139.6503,
    population: '约1396万', religion: '神道教和佛教为主，基督教约1%',
    language: '日语',
    description: '东京是日本首都，也是世界上最大的都市圈。日本基督教人口比例极低，是福音未及之地。宣教工作面临语言和文化双重挑战，但近年来越来越多的华人教会开始在东京扎根。',
    image_url: '',
    culture: '日本文化深受神道教和佛教影响，社会高度秩序化。注重礼节，鞠躬为常见问候方式。基督教在日本虽为少数，但圣诞节、婚礼教堂等文化元素已融入社会。',
    embassy_info: JSON.stringify({
      name: '中国驻日本大使馆',
      address: '3-4-33 Motoazabu, Minato-ku, Tokyo',
      phone: '+81-3-3403-3388',
      consular_hotline: '+81-3-3403-3064',
      hours: '周一至周五 9:00-12:00, 14:00-18:00'
    })
  },
  {
    name: '马德里', country: '西班牙', region: '欧洲',
    latitude: 40.4168, longitude: -3.7038,
    population: '约330万', religion: '天主教为主（约70%），基督教约3%',
    language: '西班牙语',
    description: '马德里是西班牙首都，历史上是天主教重镇。近年来福音派教会在西班牙持续增长，特别是在拉丁裔移民中。华人教会也在马德里逐渐兴起，成为向西班牙语世界宣教的桥梁。',
    image_url: '',
    culture: '西班牙文化深受天主教影响，节日众多。生活节奏较慢，午休文化盛行。西班牙语是世界上使用人数第二多的母语，掌握西班牙语对中南美洲宣教极有帮助。',
    embassy_info: JSON.stringify({
      name: '中国驻西班牙大使馆',
      address: 'C/ Arturo Soria, 113, 28043 Madrid',
      phone: '+34-91-5194242',
      consular_hotline: '+34-699-089086',
      hours: '周一至周五 9:00-14:00'
    })
  },
];

const insertMission = db.prepare(
  'INSERT INTO missions (name, country, region, latitude, longitude, population, religion, language, description, image_url, culture, embassy_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
for (const m of seedMissions) {
  insertMission.run(
    m.name, m.country, m.region, m.latitude, m.longitude,
    m.population, m.religion, m.language, m.description,
    m.image_url, m.culture, m.embassy_info
  );
}

// 插入种子经历见证
const seedTestimonies = [
  { mission_id: 1, user_id: 2, title: '在曼谷的福音之旅', content: '去年夏天我参加了曼谷的短期宣教，在当地的华人教会服事。泰国人非常友善，虽然大多数信仰佛教，但对福音持开放态度。我们在社区举办英语角活动，借此建立关系并分享信仰。最大的收获是看到一位当地大学生决志信主。' },
  { mission_id: 1, user_id: 4, title: '曼谷宣教一年回顾', content: '在曼谷生活宣教一年后，我深深体会到跨文化宣教的挑战与祝福。语言是最大的障碍，学会泰语对建立深度关系至关重要。泰国的教会虽然规模小，但弟兄姐妹信心坚定。建议后来的同工们先花时间学习语言和文化。' },
  { mission_id: 6, user_id: 2, title: '首尔教会访问记', content: '访问首尔的几家大型教会后，我被韩国教会的祷告热情和宣教心志所震撼。他们的晨祷会凌晨4点就开始了，座无虚席。韩国教会每年差派大量宣教士到世界各地，这种奉献精神值得我们学习。' },
];

const insertTestimony = db.prepare(
  'INSERT INTO testimonies (mission_id, user_id, title, content) VALUES (?, ?, ?, ?)'
);
for (const t of seedTestimonies) {
  insertTestimony.run(t.mission_id, t.user_id, t.title, t.content);
}

// 插入种子注意事项
const seedTips = [
  { mission_id: 1, user_id: 2, category: '签证办理', content: '中国公民可办理泰国落地签（15天），建议提前办理旅游签证（60天）。宣教签证需通过当地教会或机构协助办理。' },
  { mission_id: 1, user_id: 4, category: '安全提示', content: '曼谷总体安全，但需注意交通安全，摩托车事故频发。避免深夜独自前往偏僻区域。' },
  { mission_id: 1, user_id: 2, category: '健康防疫', content: '建议接种甲肝、乙肝、伤寒疫苗。注意饮食卫生，只喝瓶装水。热带地区防蚊虫叮咬。' },
  { mission_id: 1, user_id: 4, category: '气候穿着', content: '曼谷全年高温，轻便透气的衣物最合适。进入寺庙需穿着得体，遮住肩膀和膝盖。' },
  { mission_id: 1, user_id: 2, category: '风俗禁忌', content: '不可触摸他人头部，不可用脚指物，王室不可批评。在公共场所表达信仰时需注意方式方法。' },
  { mission_id: 6, user_id: 2, category: '签证办理', content: '中国公民持外交、公务护照可免签入境韩国，普通护照需办理签证。短期宣教可办理旅游签证（C-3）。' },
];

const insertTip = db.prepare(
  'INSERT INTO tips (mission_id, user_id, category, content) VALUES (?, ?, ?, ?)'
);
for (const t of seedTips) {
  insertTip.run(t.mission_id, t.user_id, t.category, t.content);
}

console.log('种子数据已成功导入！');
console.log('测试账号:');
console.log('  管理员: admin / Admin123!');
console.log('  用户: zhangsan / Test1234!');
console.log('  用户: lisi / Test1234!');
console.log('  同工: wangwu / Test1234!');