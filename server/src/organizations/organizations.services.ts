import {
  OrganizationModel,
  toPlainObject,
  generateApiKey,
  IOrganization,
} from "./organizations.models";
import {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  ListOrganizationsQuery,
} from "./organizations.validators";
import mongoose from "mongoose";

export const organizationsService = {
  // Create a new organization
  createOrganization: async (input: CreateOrganizationInput) => {
    // Check if organization name already exists
    const existingName = await OrganizationModel.findOne({
      orgName: input.orgName,
    });
    if (existingName) {
      throw new Error("Organization name already exists");
    }

    const existing = await OrganizationModel.findOne({
      orgSlug: input.orgSlug,
    });
    if (existing) {
      throw new Error("Organization slug already exists");
    }

    // Check for duplicate API key names in input
    if (input.orgApiKeys && input.orgApiKeys.length > 0) {
      const keyNames = input.orgApiKeys.map((k) => k.keyName.toLowerCase());
      const uniqueKeyNames = new Set(keyNames);
      if (keyNames.length !== uniqueKeyNames.size) {
        throw new Error("Duplicate API key names are not allowed");
      }
    }

    // Generate API keys for any provided keyNames
    const orgApiKeys = (input.orgApiKeys || []).map((key) => ({
      keyName: key.keyName,
      apiKey: generateApiKey(),
      createdAt: new Date(),
    }));

    const organization = new OrganizationModel({
      ...input,
      orgApiKeys,
    });
    await organization.save();
    return toPlainObject(organization);
  },

  // Get organization by ID
  getOrganizationById: async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const org = await OrganizationModel.findById(id);
    return org ? toPlainObject(org) : null;
  },

  // Get organization by slug
  getOrganizationBySlug: async (slug: string) => {
    const org = await OrganizationModel.findOne({ orgSlug: slug });
    return org ? toPlainObject(org) : null;
  },

  // List organizations with pagination
  listOrganizations: async (query: ListOrganizationsQuery) => {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$or = [
        { orgName: { $regex: query.search, $options: "i" } },
        { orgSlug: { $regex: query.search, $options: "i" } },
        { orgDescription: { $regex: query.search, $options: "i" } },
      ];
    }

    if (query.orgType) {
      filter.orgType = query.orgType;
    }

    const sortDirection = query.sortOrder === "asc" ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [query.sortBy]: sortDirection };

    const total = await OrganizationModel.countDocuments(filter);
    const totalPages = Math.ceil(total / query.limit);
    const skip = (query.page - 1) * query.limit;

    const organizations = await OrganizationModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(query.limit);

    return {
      data: organizations.map(toPlainObject),
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  },

  // Update organization
  updateOrganization: async (id: string, input: UpdateOrganizationInput) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    if (input.orgSlug) {
      const existing = await OrganizationModel.findOne({
        orgSlug: input.orgSlug,
        _id: { $ne: id },
      });
      if (existing) {
        throw new Error("Organization slug already exists");
      }
    }

    const organization = await OrganizationModel.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true, runValidators: true },
    );

    return organization ? toPlainObject(organization) : null;
  },

  // Delete organization
  deleteOrganization: async (id: string): Promise<boolean> => {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await OrganizationModel.findByIdAndDelete(id);
    return !!result;
  },

  // Add API key to organization
  addApiKey: async (orgId: string, keyName: string) => {
    if (!mongoose.Types.ObjectId.isValid(orgId)) return null;

    // Check if key name already exists in this organization
    const org = await OrganizationModel.findById(orgId);
    if (!org) return null;

    const existingKey = org.orgApiKeys.find(
      (k) => k.keyName.toLowerCase() === keyName.toLowerCase(),
    );
    if (existingKey) {
      throw new Error("API key name already exists in this organization");
    }

    const newKey = {
      keyName,
      apiKey: generateApiKey(),
      createdAt: new Date(),
    };

    const organization = await OrganizationModel.findByIdAndUpdate(
      orgId,
      { $push: { orgApiKeys: newKey } },
      { new: true },
    );

    if (!organization) return null;

    return {
      keyName: newKey.keyName,
      apiKey: newKey.apiKey,
      createdAt: newKey.createdAt.toISOString(),
    };
  },

  // Remove API key from organization
  removeApiKey: async (orgId: string, apiKey: string): Promise<boolean> => {
    if (!mongoose.Types.ObjectId.isValid(orgId)) return false;

    const result = await OrganizationModel.findByIdAndUpdate(
      orgId,
      { $pull: { orgApiKeys: { apiKey } } },
      { new: true },
    );

    return !!result;
  },

  // Find organization by API key
  findByApiKey: async (apiKey: string) => {
    const org = await OrganizationModel.findOne({
      "orgApiKeys.apiKey": apiKey,
    });
    return org ? toPlainObject(org) : null;
  },
};
