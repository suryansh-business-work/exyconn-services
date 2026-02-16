import mongoose from "mongoose";
import {
  ThemeProject,
  IThemeProject,
  Theme,
  ITheme,
} from "./theme.models";

// ==================== Shared Types ====================

interface ListResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

function paginate(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

// ==================== Theme Project Services ====================

export const themeProjectService = {
  list: async (
    orgId: string,
    params: { page: number; limit: number; search?: string },
  ): Promise<ListResult<IThemeProject>> => {
    const { page, limit, search } = params;
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(orgId),
    };
    if (search) query.name = { $regex: search, $options: "i" };

    const [data, total] = await Promise.all([
      ThemeProject.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      ThemeProject.countDocuments(query),
    ]);
    return { data, pagination: paginate(page, limit, total) };
  },

  create: async (
    orgId: string,
    input: { name: string; description?: string },
  ): Promise<IThemeProject> => {
    const project = new ThemeProject({
      organizationId: new mongoose.Types.ObjectId(orgId),
      ...input,
    });
    return project.save();
  },

  update: async (
    orgId: string,
    projectId: string,
    input: { name?: string; description?: string },
  ): Promise<IThemeProject | null> => {
    return ThemeProject.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(projectId), organizationId: new mongoose.Types.ObjectId(orgId) },
      { $set: input },
      { new: true },
    );
  },

  delete: async (orgId: string, projectId: string): Promise<boolean> => {
    const oid = new mongoose.Types.ObjectId(orgId);
    const pid = new mongoose.Types.ObjectId(projectId);
    await Theme.deleteMany({ organizationId: oid, projectId: pid });
    const result = await ThemeProject.findOneAndDelete({ _id: pid, organizationId: oid });
    return !!result;
  },
};

// ==================== Theme Services ====================

export const themeService = {
  list: async (
    orgId: string,
    projectId: string,
    params: { page: number; limit: number; search?: string },
  ): Promise<ListResult<ITheme>> => {
    const { page, limit, search } = params;
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(orgId),
      projectId: new mongoose.Types.ObjectId(projectId),
    };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    const [data, total] = await Promise.all([
      Theme.find(query).sort({ isDefault: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Theme.countDocuments(query),
    ]);
    return { data, pagination: paginate(page, limit, total) };
  },

  get: async (orgId: string, projectId: string, themeId: string): Promise<ITheme | null> => {
    return Theme.findOne({
      _id: new mongoose.Types.ObjectId(themeId),
      organizationId: new mongoose.Types.ObjectId(orgId),
      projectId: new mongoose.Types.ObjectId(projectId),
    });
  },

  create: async (
    orgId: string,
    projectId: string,
    input: Omit<ITheme, keyof mongoose.Document | "organizationId" | "projectId" | "createdAt" | "updatedAt">,
  ): Promise<ITheme> => {
    const oid = new mongoose.Types.ObjectId(orgId);
    const pid = new mongoose.Types.ObjectId(projectId);
    if (input.isDefault) {
      await Theme.updateMany({ organizationId: oid, projectId: pid }, { isDefault: false });
    }
    const theme = new Theme({ organizationId: oid, projectId: pid, ...input });
    return theme.save();
  },

  update: async (
    orgId: string,
    projectId: string,
    themeId: string,
    input: Record<string, unknown>,
  ): Promise<ITheme | null> => {
    const oid = new mongoose.Types.ObjectId(orgId);
    const pid = new mongoose.Types.ObjectId(projectId);
    if (input.isDefault) {
      await Theme.updateMany({ organizationId: oid, projectId: pid }, { isDefault: false });
    }
    return Theme.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(themeId), organizationId: oid, projectId: pid },
      { $set: input },
      { new: true },
    );
  },

  delete: async (orgId: string, projectId: string, themeId: string): Promise<boolean> => {
    const result = await Theme.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(themeId),
      organizationId: new mongoose.Types.ObjectId(orgId),
      projectId: new mongoose.Types.ObjectId(projectId),
    });
    return !!result;
  },

  duplicate: async (orgId: string, projectId: string, themeId: string): Promise<ITheme | null> => {
    const source = await Theme.findOne({
      _id: new mongoose.Types.ObjectId(themeId),
      organizationId: new mongoose.Types.ObjectId(orgId),
      projectId: new mongoose.Types.ObjectId(projectId),
    });
    if (!source) return null;

    const copy = new Theme({
      organizationId: source.organizationId,
      projectId: source.projectId,
      name: `${source.name} (Copy)`,
      description: source.description,
      isDefault: false,
      isActive: true,
      colors: source.colors,
      typography: source.typography,
      spacing: source.spacing,
      borderRadius: source.borderRadius,
      components: source.components,
    });
    return copy.save();
  },
};
