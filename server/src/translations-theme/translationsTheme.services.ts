import mongoose from "mongoose";
import {
  Locale,
  ILocale,
  TranslationEntry,
  ITranslationEntry,
  Theme,
  ITheme,
} from "./translationsTheme.models";

// ==================== Locale Services ====================

interface LocaleListResult {
  data: ILocale[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const localeService = {
  list: async (orgId: string, page: number, limit: number): Promise<LocaleListResult> => {
    const skip = (page - 1) * limit;
    const query = { organizationId: new mongoose.Types.ObjectId(orgId) };

    const [data, total] = await Promise.all([
      Locale.find(query).sort({ isDefault: -1, name: 1 }).skip(skip).limit(limit),
      Locale.countDocuments(query),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  create: async (
    orgId: string,
    input: { code: string; name: string; isDefault?: boolean },
  ): Promise<ILocale> => {
    const oid = new mongoose.Types.ObjectId(orgId);

    // If isDefault, unset all other defaults first
    if (input.isDefault) {
      await Locale.updateMany({ organizationId: oid }, { isDefault: false });
    }

    const locale = new Locale({ organizationId: oid, ...input });
    return locale.save();
  },

  update: async (
    orgId: string,
    localeId: string,
    input: { name?: string; isDefault?: boolean; isActive?: boolean },
  ): Promise<ILocale | null> => {
    const oid = new mongoose.Types.ObjectId(orgId);

    if (input.isDefault) {
      await Locale.updateMany({ organizationId: oid }, { isDefault: false });
    }

    return Locale.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(localeId), organizationId: oid },
      { $set: input },
      { new: true },
    );
  },

  delete: async (orgId: string, localeId: string): Promise<boolean> => {
    const result = await Locale.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(localeId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });
    return !!result;
  },
};

// ==================== Translation Services ====================

interface TranslationListResult {
  data: ITranslationEntry[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const translationService = {
  list: async (
    orgId: string,
    params: { page: number; limit: number; section?: string; search?: string },
  ): Promise<TranslationListResult> => {
    const { page, limit, section, search } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(orgId),
    };

    if (section) query.section = section;
    if (search) {
      query.$or = [
        { key: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      TranslationEntry.find(query).sort({ section: 1, key: 1 }).skip(skip).limit(limit),
      TranslationEntry.countDocuments(query),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  getSections: async (orgId: string): Promise<string[]> => {
    return TranslationEntry.distinct("section", {
      organizationId: new mongoose.Types.ObjectId(orgId),
    });
  },

  upsert: async (
    orgId: string,
    input: { section: string; key: string; values: Record<string, string>; description?: string },
  ): Promise<ITranslationEntry> => {
    const oid = new mongoose.Types.ObjectId(orgId);

    return TranslationEntry.findOneAndUpdate(
      { organizationId: oid, section: input.section, key: input.key },
      { $set: { values: input.values, description: input.description } },
      { new: true, upsert: true },
    ) as unknown as ITranslationEntry;
  },

  bulkUpsert: async (
    orgId: string,
    section: string,
    entries: Array<{ key: string; values: Record<string, string>; description?: string }>,
  ): Promise<{ upserted: number; modified: number }> => {
    const oid = new mongoose.Types.ObjectId(orgId);

    const ops = entries.map((entry) => ({
      updateOne: {
        filter: { organizationId: oid, section, key: entry.key },
        update: { $set: { values: entry.values, description: entry.description } },
        upsert: true,
      },
    }));

    const result = await TranslationEntry.bulkWrite(ops);
    return {
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
    };
  },

  delete: async (orgId: string, entryId: string): Promise<boolean> => {
    const result = await TranslationEntry.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(entryId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });
    return !!result;
  },
};

// ==================== Theme Services ====================

interface ThemeListResult {
  data: ITheme[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const themeService = {
  list: async (
    orgId: string,
    params: { page: number; limit: number; search?: string },
  ): Promise<ThemeListResult> => {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(orgId),
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      Theme.find(query).sort({ isDefault: -1, createdAt: -1 }).skip(skip).limit(limit),
      Theme.countDocuments(query),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  get: async (orgId: string, themeId: string): Promise<ITheme | null> => {
    return Theme.findOne({
      _id: new mongoose.Types.ObjectId(themeId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });
  },

  create: async (
    orgId: string,
    input: Omit<ITheme, keyof mongoose.Document | "organizationId" | "createdAt" | "updatedAt">,
  ): Promise<ITheme> => {
    const oid = new mongoose.Types.ObjectId(orgId);

    if (input.isDefault) {
      await Theme.updateMany({ organizationId: oid }, { isDefault: false });
    }

    const theme = new Theme({ organizationId: oid, ...input });
    return theme.save();
  },

  update: async (
    orgId: string,
    themeId: string,
    input: Record<string, unknown>,
  ): Promise<ITheme | null> => {
    const oid = new mongoose.Types.ObjectId(orgId);

    if (input.isDefault) {
      await Theme.updateMany({ organizationId: oid }, { isDefault: false });
    }

    return Theme.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(themeId), organizationId: oid },
      { $set: input },
      { new: true },
    );
  },

  delete: async (orgId: string, themeId: string): Promise<boolean> => {
    const result = await Theme.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(themeId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });
    return !!result;
  },

  duplicate: async (orgId: string, themeId: string): Promise<ITheme | null> => {
    const source = await Theme.findOne({
      _id: new mongoose.Types.ObjectId(themeId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });

    if (!source) return null;

    const copy = new Theme({
      organizationId: source.organizationId,
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
