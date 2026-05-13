-- ============================================
-- 冷钢碳排放AI智慧管理平台 数据库初始化脚本
-- ============================================

CREATE DATABASE IF NOT EXISTS carbon_main DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS carbon_report DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE carbon_main;

-- 企业组织表
CREATE TABLE IF NOT EXISTS organization (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(128) NOT NULL COMMENT '企业名称',
    code VARCHAR(32) NOT NULL COMMENT '企业编码',
    address VARCHAR(512) COMMENT '企业地址',
    production_info JSON COMMENT '生产信息',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='企业组织';

-- 工序表
CREATE TABLE IF NOT EXISTS process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    org_id BIGINT NOT NULL COMMENT '所属企业ID',
    name VARCHAR(64) NOT NULL COMMENT '工序名称',
    code VARCHAR(32) NOT NULL COMMENT '工序编码',
    type VARCHAR(32) NOT NULL COMMENT '工序类型',
    equipment_info JSON COMMENT '设备信息',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_org_id (org_id)
) COMMENT='工序';

-- 排放源表
CREATE TABLE IF NOT EXISTS emission_source (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    process_id BIGINT NOT NULL COMMENT '所属工序ID',
    name VARCHAR(128) NOT NULL COMMENT '排放源名称',
    code VARCHAR(32) NOT NULL COMMENT '排放源编码',
    type VARCHAR(32) NOT NULL COMMENT '排放源类型',
    fuel_type VARCHAR(64) COMMENT '燃料类型',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_process_id (process_id)
) COMMENT='排放源';

-- 活动数据表
CREATE TABLE IF NOT EXISTS activity_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_id BIGINT COMMENT '排放源ID',
    process_id BIGINT NOT NULL COMMENT '工序ID',
    param_code VARCHAR(32) NOT NULL COMMENT '参数代码',
    param_name VARCHAR(128) NOT NULL COMMENT '参数名称',
    value DECIMAL(18,4) NOT NULL COMMENT '数值',
    unit VARCHAR(32) NOT NULL COMMENT '单位',
    period_month DATE NOT NULL COMMENT '数据所属月份',
    data_source VARCHAR(32) NOT NULL DEFAULT 'MANUAL' COMMENT '数据来源',
    status VARCHAR(16) NOT NULL DEFAULT 'DRAFT' COMMENT '状态',
    remark VARCHAR(512) COMMENT '备注',
    created_by BIGINT COMMENT '创建人',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_process_period (process_id, period_month),
    INDEX idx_param_code (param_code),
    INDEX idx_status (status)
) COMMENT='活动数据';

-- 排放因子表
CREATE TABLE IF NOT EXISTS emission_factor (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(128) NOT NULL COMMENT '因子名称',
    code VARCHAR(32) NOT NULL COMMENT '因子编码',
    category VARCHAR(32) NOT NULL COMMENT '类别',
    value DECIMAL(18,6) NOT NULL COMMENT '因子值',
    unit VARCHAR(64) NOT NULL COMMENT '单位',
    source_type VARCHAR(16) NOT NULL COMMENT '来源',
    standard_ref VARCHAR(128) COMMENT '标准引用',
    version INT NOT NULL DEFAULT 1 COMMENT '版本号',
    effective_date DATE NOT NULL COMMENT '生效日期',
    expire_date DATE COMMENT '失效日期',
    lower_heating_value DECIMAL(18,6) COMMENT '低位发热量',
    carbon_content DECIMAL(18,6) COMMENT '含碳量',
    oxidation_rate DECIMAL(6,4) COMMENT '氧化率',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_code (code)
) COMMENT='排放因子';

-- 碳排放结果表
CREATE TABLE IF NOT EXISTS emission_result (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    activity_data_id BIGINT NOT NULL COMMENT '活动数据ID',
    factor_id BIGINT NOT NULL COMMENT '排放因子ID',
    process_id BIGINT NOT NULL COMMENT '工序ID',
    activity_value DECIMAL(18,4) NOT NULL COMMENT '活动数据值',
    factor_value DECIMAL(18,6) NOT NULL COMMENT '排放因子值',
    emission_value DECIMAL(18,4) NOT NULL COMMENT '排放量(tCO2)',
    emission_type VARCHAR(32) NOT NULL COMMENT '排放类型',
    calculation_method VARCHAR(32) NOT NULL COMMENT '计算方法',
    calculation_detail JSON NOT NULL COMMENT '计算过程明细',
    period_month DATE NOT NULL COMMENT '核算月份',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_period (period_month),
    INDEX idx_process (process_id),
    INDEX idx_type (emission_type)
) COMMENT='碳排放结果';

-- 碳配额表
CREATE TABLE IF NOT EXISTS quota (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    org_id BIGINT NOT NULL COMMENT '企业ID',
    quota_type VARCHAR(32) NOT NULL COMMENT '类型',
    amount DECIMAL(18,4) NOT NULL COMMENT '配额数量',
    used_amount DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT '已使用量',
    remaining DECIMAL(18,4) NOT NULL COMMENT '剩余量',
    valid_from DATE NOT NULL COMMENT '有效期起始',
    valid_to DATE NOT NULL COMMENT '有效期截止',
    source VARCHAR(64) COMMENT '来源说明',
    price DECIMAL(18,4) COMMENT '成交价格',
    trade_date DATE COMMENT '交易日期',
    batch_no VARCHAR(32) COMMENT '批次号',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_org (org_id),
    INDEX idx_type (quota_type)
) COMMENT='碳配额';

-- 预警表
CREATE TABLE IF NOT EXISTS alert (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    process_id BIGINT COMMENT '关联工序ID',
    alert_type VARCHAR(32) NOT NULL COMMENT '预警类型',
    level VARCHAR(16) NOT NULL COMMENT '级别',
    title VARCHAR(256) NOT NULL COMMENT '预警标题',
    description TEXT NOT NULL COMMENT '预警描述',
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING' COMMENT '状态',
    rule_config JSON NOT NULL COMMENT '触发规则配置',
    triggered_at DATETIME NOT NULL COMMENT '触发时间',
    resolved_at DATETIME COMMENT '处理时间',
    resolved_by BIGINT COMMENT '处理人',
    resolution TEXT COMMENT '处置说明',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_level (level),
    INDEX idx_triggered (triggered_at)
) COMMENT='预警';

-- 用户表
CREATE TABLE IF NOT EXISTS user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE COMMENT '用户名',
    password_hash VARCHAR(256) NOT NULL COMMENT '密码哈希',
    real_name VARCHAR(64) COMMENT '真实姓名',
    email VARCHAR(128) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态(1启用/0禁用)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='用户';

-- 角色表
CREATE TABLE IF NOT EXISTS role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL COMMENT '角色名称',
    code VARCHAR(32) NOT NULL UNIQUE COMMENT '角色编码',
    description VARCHAR(256) COMMENT '角色描述',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) COMMENT='角色';

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS user_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_role (user_id, role_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
) COMMENT='用户角色关联';

-- ============================================
-- 初始化基础数据
-- ============================================

-- 初始化企业
INSERT INTO organization (id, name, code, address) VALUES
(1, '冷钢集团有限公司', 'LG', '湖南省娄底市');

-- 初始化工序
INSERT INTO process (id, org_id, name, code, type) VALUES
(1, 1, '烧结', 'SINTERING', 'IRONMAKING'),
(2, 1, '炼铁', 'IRONMAKING', 'IRONMAKING'),
(3, 1, '炼钢', 'STEELMAKING', 'STEELMAKING'),
(4, 1, '轧钢', 'ROLLING', 'ROLLING'),
(5, 1, '焦化', 'COKING', 'IRONMAKING');

-- 初始化排放因子（依据GB/T 32150标准）
INSERT INTO emission_factor (name, code, category, value, unit, source_type, standard_ref, version, effective_date, lower_heating_value, carbon_content, oxidation_rate) VALUES
('焦炭', 'FUEL_COKE', 'FUEL', 0.00028435, 'TJ/t', 'NATIONAL', 'GB/T 32150', 1, '2025-01-01', 28.435, 94.000, 0.988),
('无烟煤', 'FUEL_ANTHRACITE', 'FUEL', 0.00020908, 'TJ/t', 'NATIONAL', 'GB/T 32150', 1, '2025-01-01', 20.908, 93.600, 0.940),
('烟煤', 'FUEL_BITUMINOUS', 'FUEL', 0.00020908, 'TJ/t', 'NATIONAL', 'GB/T 32150', 1, '2025-01-01', 20.908, 80.700, 0.981),
('天然气', 'FUEL_NATGAS', 'FUEL', 0.00038931, 'TJ/万m3', 'NATIONAL', 'GB/T 32150', 1, '2025-01-01', 389.31, 15.300, 0.995),
('石灰石分解', 'PROC_LIMESTONE', 'PROCESS', 0.4397, 'tCO2/t', 'NATIONAL', 'GB/T 32150', 1, '2025-01-01', NULL, NULL, NULL),
('白云石分解', 'PROC_DOLOMITE', 'PROCESS', 0.4743, 'tCO2/t', 'NATIONAL', 'GB/T 32150', 1, '2025-01-01', NULL, NULL, NULL),
('华中电网', 'ELEC_CENTRAL', 'ELECTRICITY', 0.5810, 'tCO2/MWh', 'NATIONAL', '生态环境部公告', 1, '2025-01-01', NULL, NULL, NULL);

-- 初始化角色
INSERT INTO role (id, name, code, description) VALUES
(1, '系统管理员', 'ADMIN', '系统全部权限'),
(2, '碳管理主管', 'CARBON_MANAGER', '碳排放管理与审批权限'),
(3, '能源统计员', 'ENERGY_OPERATOR', '能源数据录入和核算权限'),
(4, '生产调度', 'PRODUCTION_SCHEDULER', '生产相关碳排放查看权限'),
(5, '财务人员', 'FINANCE', '碳交易和财务相关权限'),
(6, '只读用户', 'VIEWER', '数据查看权限');

-- 初始化用户 (密码均为 bcrypt hash, 明文: admin123/manager123/oper123)
-- bcrypt hash of "admin123": $2b$12$LJ3m4ys3Lk0OV6yR1dRBdeYBEP6BKCu6GTkQqC1b0HnK1nV6dHY9e
INSERT INTO user (id, username, password_hash, real_name, email, phone) VALUES
(1, 'admin', '$2b$12$LJ3m4ys3Lk0OV6yR1dRBdeYBEP6BKCu6GTkQqC1b0HnK1nV6dHY9e', '管理员', 'admin@lenggang.com', '13800000001'),
(2, 'manager', '$2b$12$LJ3m4ys3Lk0OV6yR1dRBdeYBEP6BKCu6GTkQqC1b0HnK1nV6dHY9e', '张管理', 'manager@lenggang.com', '13800000002'),
(3, 'operator', '$2b$12$LJ3m4ys3Lk0OV6yR1dRBdeYBEP6BKCu6GTkQqC1b0HnK1nV6dHY9e', '李操作', 'operator@lenggang.com', '13800000003');

-- 分配角色
INSERT INTO user_role (user_id, role_id) VALUES
(1, 1),
(2, 2),
(3, 3);
