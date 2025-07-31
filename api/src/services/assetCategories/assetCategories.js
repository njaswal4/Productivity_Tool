import { db } from 'src/lib/db'

export const assetCategories = () => {
  return db.assetCategory.findMany({
    include: {
      assets: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export const assetCategory = ({ id }) => {
  return db.assetCategory.findUnique({
    where: { id },
    include: {
      assets: {
        include: {
          assignments: {
            where: {
              status: 'Active',
            },
            include: {
              user: true,
            },
          },
        },
      },
    },
  })
}

export const createAssetCategory = ({ input }) => {
  return db.assetCategory.create({
    data: input,
    include: {
      assets: true,
    },
  })
}

export const updateAssetCategory = ({ id, input }) => {
  return db.assetCategory.update({
    data: input,
    where: { id },
    include: {
      assets: true,
    },
  })
}

export const deleteAssetCategory = ({ id }) => {
  return db.assetCategory.delete({
    where: { id },
    include: {
      assets: true,
    },
  })
}

export const AssetCategory = {
  assets: (_obj, { root }) => {
    return db.assetCategory.findUnique({ where: { id: root?.id } }).assets()
  },
}
