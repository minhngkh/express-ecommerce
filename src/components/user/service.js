const { eq } = require("drizzle-orm");

const db = require("#db/client");
const { user, address } = require("#db/schema");
const { pick } = require("#utils/objectHelpers");

const fieldsDict = {
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  password: user.password,
  avatar: user.avatar,
  createdAt: user.createdAt,
  isVerified: user.isVerified,
};

/**
 *
 * @param {number} userId
 * @param {keyof fieldsDict} fields
 * @returns
 */
exports.getUserInfo = (userId, fields) => {
  if (fields.length === 0) {
    return null;
  }

  const query = db
    .select(pick(fieldsDict, fields))
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return query.then((val) => val[0]);
};

/**
 *
 * @param {number} userId
 * @returns
 */
exports.getUserInfoWithAddress = (userId) => {
  const query = db
    .select({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar,
      address: {
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        district: address.district,
        cityOrProvince: address.cityOrProvince,
      },
    })
    .from(user)
    .innerJoin(address, eq(user.addressId, address.id))
    .where(eq(user.id, userId));

  return query.then((val) => {
    return val.length ? val[0] : null;
  });
};

/**
 *
 * @param {string} email
 * @param {keyof fieldsDict} fields
 * @returns
 */
exports.getUserInfoFromEmail = (email, fields) => {
  if (fields.length === 0) {
    return null;
  }

  const query = db
    .select(pick(fieldsDict, fields))
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  return query.then((val) => val[0]);
};

/**
 * Create a new address
 * @param {object} addressData
 * @param {string} addressData.fullName
 * @param {string} addressData.phoneNumber
 * @param {string} addressData.addressLine1
 * @param {string} addressData.addressLine2
 * @param {string} addressData.district
 * @param {string} addressData.cityOrProvince
 * @returns
 */
exports.createAddress = (addressData) => {
  const query = db
    .insert(address)
    .values({
      fullName: addressData.fullName,
      phoneNumber: addressData.phoneNumber,
      addressLine1: addressData.addressLine1,
      addressLine2: addressData.addressLine2,
      district: addressData.district,
      cityOrProvince: addressData.cityOrProvince,
    })
    .returning({
      insertedId: address.id,
    });

  return query.then((val) => val[0].insertedId);
};

/**
 * Update address of user
 * @param {number} userId
 * @param {object} addressData
 * @param {string} addressData.fullName
 * @param {string} addressData.phoneNumber
 * @param {string} addressData.addressLine1
 * @param {string} [addressData.addressLine2]
 * @param {string} addressData.district
 * @param {string} addressData.cityOrProvince
 * @returns
 */
exports.updateUserAddress = (userId, addressData) => {
  const transaction = db.transaction(async (tx) => {
    const curAddressId = await tx
      .select({
        addressId: user.addressId,
      })
      .from(user)
      .where(eq(user.id, userId))
      .then((val) => val[0].addressId);

    await tx.update(user).set({ addressId: null }).where(eq(user.id, userId));

    try {
      await tx.delete(address).where(eq(address.id, curAddressId));
    } catch (err) {
      console.log("address still in used, skip delete");
    }

    const newAddressId = await tx
      .insert(address)
      .values(addressData)
      .returning({
        addressId: address.id,
      })
      .then((val) => val[0].addressId);

    await tx
      .update(user)
      .set({ addressId: newAddressId })
      .where(eq(user.id, userId));
  });

  return transaction;
};

exports.getUserAddress = (userId) => {
  const query = db
    .select({
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      district: address.district,
      cityOrProvince: address.cityOrProvince,
    })
    .from(user)
    .innerJoin(address, eq(user.addressId, address.id))
    .where(eq(user.id, userId));

  return query.then((val) => {
    return val.length ? val[0] : null;
  });
};

/**
 *
 * @param {number} userId
 * @param {object} userData
 * @param {string} [userData.fullName]
 * @param {string} [userData.avatar]
 * @returns
 */
exports.updateUserInfo = (userId, userData) => {
  const query = db.update(user).set(userData).where(eq(user.id, userId));

  return query;
};
