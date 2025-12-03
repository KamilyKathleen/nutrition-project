export const createMockModel = () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  save: jest.fn(),
  deleteOne: jest.fn(),
  updateOne: jest.fn()
});

export const createMockQuery = (data: any = []) => ({
  select: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(data),
  lean: jest.fn().mockReturnThis()
});

export const createMockDocument = (data: any) => ({
  ...data,
  _id: data._id || 'mock-id',
  save: jest.fn().mockResolvedValue(data),
  remove: jest.fn().mockResolvedValue(true),
  toObject: jest.fn().mockReturnValue(data),
  toJSON: jest.fn().mockReturnValue(data)
});

export const createMockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  user: null,
  headers: {},
  ...overrides
});

export const createMockResponse = () => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis()
  };
  return res;
};

export const createMockNext = () => jest.fn();
