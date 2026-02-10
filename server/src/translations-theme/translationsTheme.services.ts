import mongoose from "mongoose";
import {
  TranslationProject,
  ITranslationProject,
  Locale,
  ILocale,
  TranslationEntry,
  ITranslationEntry,
  ThemeProject,
  IThemeProject,
  Theme,
  ITheme,
} from "./translationsTheme.models";

// ==================== Shared Types ====================

interface ListResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

function paginate(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

// ==================== Translation Project Services ====================

export const translationProjectService = {
  list: async (
    orgId: string,
    params: { page: number; limit: number; search?: string },
  ): Promise<ListResult<ITranslationProject>> => {
    const { page, limit, search } = params;
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(orgId),
    };
    if (search) query.name = { $regex: search, $options: "i" };

    const [data, total] = await Promise.all([
      TranslationProject.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      TranslationProject.countDocuments(query),
    ]);
    return { data, pagination: paginate(page, limit, total) };
  },

  create: async (
    orgId: string,
    input: { name: string; description?: string },
  ): Promise<ITranslationProject> => {
    const project = new TranslationProject({
      organizationId: new mongoose.Types.ObjectId(orgId),
      ...input,
    });
    return project.save();
  },

  update: async (
    orgId: string,
    projectId: string,
    input: { name?: string; description?: string },
  ): Promise<ITranslationProject | null> => {
    return TranslationProject.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(projectId), organizationId: new mongoose.Types.ObjectId(orgId) },
      { $set: input },
      { new: true },
    );
  },

  delete: async (orgId: string, projectId: string): Promise<boolean> => {
    const oid = new mongoose.Types.ObjectId(orgId);
    const pid = new mongoose.Types.ObjectId(projectId);
    await Promise.all([
      Locale.deleteMany({ organizationId: oid, projectId: pid }),
      TranslationEntry.deleteMany({ organizationId: oid, projectId: pid }),
    ]);
    const result = await TranslationProject.findOneAndDelete({ _id: pid, organizationId: oid });
    return !!result;
  },
};

// ==================== Locale Services ====================

export const localeService = {
  list: async (
    orgId: string,
    projectId: string,
    page: number,
    limit: number,
  ): Promise<ListResult<ILocale>> => {
    const query = {
      organizationId: new mongoose.Types.ObjectId(orgId),
      projectId: new mongoose.Types.ObjectId(projectId),
    };
    const [data, total] = await Promise.all([
      Locale.find(query).sort({ isDefault: -1, name: 1 }).skip((page - 1) * limit).limit(limit),
      Locale.countDocuments(query),
    ]);
    return { data, pagination: paginate(page, limit, total) };
  },

  create: async (
    orgId: string,
    projectId: string,
    input: { code: string; name: string; isDefault?: boolean },
  ): Promise<ILocale> => {
    const oid = new mongoose.Types.ObjectId(orgId);
    const pid = new mongoose.Types.ObjectId(projectId);
    if (input.isDefault) {
      await Locale.updateMany({ organizationId: oid, projectId: pid }, { isDefault: false });
    }
    const locale = new Locale({ organizationId: oid, projectId: pid, ...input });
    return locale.save();
  },

  bulkCreate: async (
    orgId: string,
    projectId: string,
    locales: Array<{ code: string; name: string; isDefault?: boolean }>,
  ): Promise<ILocale[]> => {
    const oid = new mongoose.Types.ObjectId(orgId);
    const pid = new mongoose.Types.ObjectId(projectId);
    const docs = locales.map((l) => ({ organizationId: oid, projectId: pid, ...l }));
    return Locale.insertMany(docs, { ordered: false }).catch(() => []);
  },

  update: async (
    orgId: string,
    projectId: string,
    localeId: string,
    input: { name?: string; isDefault?: boolean; isActive?: boolean },
  ): Promise<ILocale | null> => {
    const oid = new mongoose.Types.ObjectId(orgId);
    const pid = new mongoose.Types.ObjectId(projectId);
    if (input.isDefault) {
      await Locale.updateMany({ organizationId: oid, projectId: pid }, { isDefault: false });
    }
    return Locale.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(localeId), organizationId: oid, projectId: pid },
      { $set: input },
      { new: true },
    );
  },

  delete: async (orgId: string, projectId: string, localeId: string): Promise<boolean> => {
    const result = await Locale.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(localeId),
      organizationId: new mongoose.Types.ObjectId(orgId),
      projectId: new mongoose.Types.ObjectId(projectId),
    });
    return !!result;
  },
};

// ==================== Translation Services ====================

export const translationService = {
  list: async (
    orgId: string,
    projectId: string,
    params: { page: number; limit: number; section?: string; search?: string },
  ): Promise<ListResult<ITranslationEntry>> => {
    const { page, limit, section, search } = params;
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(orgId),
      projectId: new mongoose.Types.ObjectId(projectId),
    };
    if (section) query.section = section;
    if (search) {
      query.$or = [
        { key: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    const [data, total] = await Promise.all([
      TranslationEntry.find(query).sort({ section: 1, key: 1 }).skip((page - 1) * limit).limit(limit),
      TranslationEntry.countDocuments(query),
    ]);
    return { data, pagination: paginate(page, limit, total) };
  },

  getSections: async (orgId: string, projectId: string): Promise<string[]> => {
    return TranslationEntry.distinct("section", {
      organizationId: new mongoose.Types.ObjectId(orgId),
      projectId: new mongoose.Types.ObjectId(projectId),
    });
  },

  upsert: async (
    orgId: string,
    projectId: string,
    input: { section: string; key: string; values: Record<string, string>; description?: string },
  ): Promise<ITranslationEntry> => {
    const oid = new mongoose.Types.ObjectId(orgId);
    const pid = new mongoose.Types.ObjectId(projectId);
    return TranslationEntry.findOneAndUpdate(
      { organizationId: oid, projectId: pid, section: input.section, key: input.key },
      { $set: { values: input.values, description: input.description } },
      { new: true, upsert: true },
    ) as unknown as ITranslationEntry;
  },

  bulkUpsert: async (
    orgId: string,
    projectId: string,
    section: string,
    entries: Array<{ key: string; values: Record<string, string>; description?: string }>,
  ): Promise<{ upserted: number; modified: number }> => {
    const oid = new mongoose.Types.ObjectId(orgId);
    const pid = new mongoose.Types.ObjectId(projectId);
    const ops = entries.map((entry) => ({
      updateOne: {
        filter: { organizationId: oid, projectId: pid, section, key: entry.key },
        update: { $set: { values: entry.values, description: entry.description } },
        upsert: true,
      },
    }));
    const result = await TranslationEntry.bulkWrite(ops);
    return { upserted: result.upsertedCount, modified: result.modifiedCount };
  },

  delete: async (orgId: string, projectId: string, entryId: string): Promise<boolean> => {
    const result = await TranslationEntry.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(entryId),
      organizationId: new mongoose.Types.ObjectId(orgId),
      projectId: new mongoose.Types.ObjectId(projectId),
    });
    return !!result;
  },
};

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
