import { db } from 'src/lib/db'

export const officeSupplyCategories = () => {
  return db.officeSupplyCategory.findMany()
}

export const officeSupplyCategory = ({ id }) => {
  return db.officeSupplyCategory.findUnique({
    where: { id },
  })
}

export const createOfficeSupplyCategory = ({ input }) => {
  return db.officeSupplyCategory.create({
    data: input,
  })
}

export const updateOfficeSupplyCategory = ({ id, input }) => {
  return db.officeSupplyCategory.update({
    data: input,
    where: { id },
  })
}

export const deleteOfficeSupplyCategory = ({ id }) => {
  return db.officeSupplyCategory.delete({
    where: { id },
  })
}

export const OfficeSupplyCategory = {
  supplies: (_obj, { root }) => {
    return db.officeSupplyCategory
      .findUnique({ where: { id: root?.id } })
      .supplies()
  },
}
