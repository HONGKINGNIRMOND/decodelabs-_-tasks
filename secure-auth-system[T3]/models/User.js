const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const argon2 = require('argon2');

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                len: {
                    args: [2, 50],
                    msg: 'Name must be between 2 and 50 characters',
                },
                notEmpty: {
                    msg: 'Name is required',
                },
            },
            set(value) {
                this.setDataValue('name', value.trim());
            },
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: {
                msg: 'A user with this email already exists',
            },
            validate: {
                isEmail: {
                    msg: 'Please provide a valid email address',
                },
                notEmpty: {
                    msg: 'Email is required',
                },
            },
            set(value) {
                this.setDataValue('email', value.trim().toLowerCase());
            },
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len: {
                    args: [8, 255],
                    msg: 'Password must be at least 8 characters',
                },
                notEmpty: {
                    msg: 'Password is required',
                },
            },
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            defaultValue: 'user',
            allowNull: false,
        },
    },
    {
        tableName: 'users',
        timestamps: true,
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await argon2.hash(user.password, {
                        type: argon2.argon2id,
                        memoryCost: 65536,
                        timeCost: 3,
                        parallelism: 4,
                    });
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    user.password = await argon2.hash(user.password, {
                        type: argon2.argon2id,
                        memoryCost: 65536,
                        timeCost: 3,
                        parallelism: 4,
                    });
                }
            },
        },
    }
);

User.prototype.comparePassword = async function (candidatePassword) {
    try {
        return await argon2.verify(this.password, candidatePassword);
    } catch {
        return false;
    }
};

User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
};

module.exports = User;
