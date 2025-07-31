import { db } from 'src/lib/db'

export const assets = () => {
  return db.asset.findMany({
    include: {
      category: true,
      assignments: {
        where: {
          status: 'Active',
        },
        include: {
          user: true,
        },
      },
    },
    orderBy: [
      { status: 'asc' },
      { assetId: 'asc' },
    ],
  })
}

export const asset = ({ id }) => {
  return db.asset.findUnique({
    where: { id },
    include: {
      category: true,
      assignments: {
        include: {
          user: true,
        },
        orderBy: {
          issueDate: 'desc',
        },
      },
    },
  })
}

export const assetByAssetId = ({ assetId }) => {
  return db.asset.findUnique({
    where: { assetId },
    include: {
      category: true,
      assignments: {
        where: {
          status: 'Active',
        },
        include: {
          user: true,
        },
      },
    },
  })
}

export const availableAssets = () => {
  return db.asset.findMany({
    where: {
      status: 'Available',
    },
    include: {
      category: true,
    },
    orderBy: {
      assetId: 'asc',
    },
  })
}

export const assetsByCategory = ({ categoryId }) => {
  return db.asset.findMany({
    where: {
      categoryId,
    },
    include: {
      category: true,
      assignments: {
        where: {
          status: 'Active',
        },
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      assetId: 'asc',
    },
  })
}

export const assetsByUser = ({ userId }) => {
  return db.asset.findMany({
    where: {
      assignments: {
        some: {
          userId,
          status: 'Active',
        },
      },
    },
    include: {
      category: true,
      assignments: {
        where: {
          userId,
          status: 'Active',
        },
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      assetId: 'asc',
    },
  })
}

export const createAsset = ({ input }) => {
  return db.asset.create({
    data: {
      ...input,
      status: input.status || 'Available',
      condition: input.condition || 'Good',
    },
    include: {
      category: true,
      assignments: true,
    },
  })
}

export const updateAsset = ({ id, input }) => {
  return db.asset.update({
    data: input,
    where: { id },
    include: {
      category: true,
      assignments: {
        include: {
          user: true,
        },
      },
    },
  })
}

export const deleteAsset = ({ id }) => {
  return db.asset.delete({
    where: { id },
    include: {
      category: true,
      assignments: true,
    },
  })
}

export const Asset = {
  category: (_obj, { root }) => {
    return db.asset.findUnique({ where: { id: root?.id } }).category()
  },
  assignments: (_obj, { root }) => {
    return db.asset.findUnique({ where: { id: root?.id } }).assignments()
  },
}
