import mongoose from "mongoose";
import {
  TranslationProject,
  ITranslationProject,
  Locale,
  ILocale,
  TranslationEntry,
  ITranslationEntry,
} from "./translations.models";
import { AICompany } from "../ai/companies/company.models";
import { aiProviderClient, AIProviderConfig } from "../ai/providers";
import { IChatMessage } from "../ai/chats/chat.models";

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

  addSection: async (
    orgId: string,
    projectId: string,
    section: { name: string; slug: string },
  ): Promise<ITranslationProject | null> => {
    const oid = new mongoose.Types.ObjectId(orgId);
    const pid = new mongoose.Types.ObjectId(projectId);
    const project = await TranslationProject.findOne({ _id: pid, organizationId: oid });
    if (!project) return null;
    const exists = project.sections.some((s) => s.slug === section.slug);
    if (exists) return project;
    project.sections.push(section);
    return project.save();
  },

  removeSection: async (
    orgId: string,
    projectId: string,
    slug: string,
  ): Promise<ITranslationProject | null> => {
    return TranslationProject.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(projectId), organizationId: new mongoose.Types.ObjectId(orgId) },
      { $pull: { sections: { slug } } },
      { new: true },
    );
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
    input: { code: string; name: string; nativeName: string; flag?: string; isDefault?: boolean },
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
    locales: Array<{ code: string; name: string; nativeName: string; flag?: string; isDefault?: boolean }>,
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
    input: { name?: string; nativeName?: string; flag?: string; isDefault?: boolean; isActive?: boolean },
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

  getLocaleCounts: async (
    orgId: string,
    projectIds: string[],
  ): Promise<Record<string, number>> => {
    const result = await Locale.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(orgId),
          projectId: { $in: projectIds.map((id) => new mongoose.Types.ObjectId(id)) },
        },
      },
      { $group: { _id: "$projectId", count: { $sum: 1 } } },
    ]);
    const counts: Record<string, number> = {};
    result.forEach((r: { _id: mongoose.Types.ObjectId; count: number }) => {
      counts[r._id.toString()] = r.count;
    });
    return counts;
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

  getSections: async (
    orgId: string,
    projectId: string,
  ): Promise<Array<{ name: string; slug: string; variableCount: number }>> => {
    const oid = new mongoose.Types.ObjectId(orgId);
    const pid = new mongoose.Types.ObjectId(projectId);
    const [entryCounts, project] = await Promise.all([
      TranslationEntry.aggregate([
        { $match: { organizationId: oid, projectId: pid } },
        { $group: { _id: "$section", count: { $sum: 1 } } },
      ]),
      TranslationProject.findOne({ _id: pid, organizationId: oid }),
    ]);
    const countMap: Record<string, number> = {};
    entryCounts.forEach((r: { _id: string; count: number }) => {
      countMap[r._id] = r.count;
    });
    const sections = (project?.sections || []).map((s) => ({
      name: s.name,
      slug: s.slug,
      variableCount: countMap[s.slug] || 0,
    }));
    return sections;
  },

  upsert: async (
    orgId: string,
    projectId: string,
    input: { section: string; key: string; values: Record<string, string>; defaultValue?: string; description?: string },
  ): Promise<ITranslationEntry> => {
    const oid = new mongoose.Types.ObjectId(orgId);
    const pid = new mongoose.Types.ObjectId(projectId);
    const setFields: Record<string, unknown> = { values: input.values };
    if (input.description !== undefined) setFields.description = input.description;
    if (input.defaultValue !== undefined) setFields.defaultValue = input.defaultValue;
    return TranslationEntry.findOneAndUpdate(
      { organizationId: oid, projectId: pid, section: input.section, key: input.key },
      { $set: setFields },
      { new: true, upsert: true },
    ) as unknown as ITranslationEntry;
  },

  bulkUpsert: async (
    orgId: string,
    projectId: string,
    section: string,
    entries: Array<{ key: string; values: Record<string, string>; defaultValue?: string; description?: string }>,
  ): Promise<{ upserted: number; modified: number }> => {
    const oid = new mongoose.Types.ObjectId(orgId);
    const pid = new mongoose.Types.ObjectId(projectId);
    const ops = entries.map((entry) => ({
      updateOne: {
        filter: { organizationId: oid, projectId: pid, section, key: entry.key },
        update: { $set: { values: entry.values, defaultValue: entry.defaultValue, description: entry.description } },
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

// ==================== Auto-Translate Service ====================

export const autoTranslateService = {
  translate: async (
    orgId: string,
    projectId: string,
    sourceLocaleCode: string,
    targetLocaleCode: string,
    texts: Record<string, string>,
  ): Promise<Record<string, string>> => {
    const oid = new mongoose.Types.ObjectId(orgId);
    const pid = new mongoose.Types.ObjectId(projectId);

    const company = await AICompany.findOne({ organizationId: oid, isActive: true });
    if (!company) throw new Error("No active AI company configured. Add an AI provider in AI settings.");

    const model = company.defaultModel || company.availableModels[0];
    if (!model) throw new Error("No AI model configured on the active AI company.");

    const [sourceLoc, targetLoc] = await Promise.all([
      Locale.findOne({ organizationId: oid, projectId: pid, code: sourceLocaleCode }),
      Locale.findOne({ organizationId: oid, projectId: pid, code: targetLocaleCode }),
    ]);
    const sourceLang = sourceLoc?.name || sourceLocaleCode;
    const targetLang = targetLoc?.name || targetLocaleCode;

    const config: AIProviderConfig = {
      provider: company.provider,
      apiKey: company.apiKey,
      apiSecret: company.apiSecret,
      baseUrl: company.baseUrl,
    };

    const textEntries = Object.entries(texts);
    if (textEntries.length === 0) return {};

    if (textEntries.length === 1) {
      const [key, text] = textEntries[0];
      const messages: IChatMessage[] = [
        { role: "system", content: `You are a professional translator. Translate text accurately from ${sourceLang} to ${targetLang}. Return ONLY the translated text, no explanations or additions.`, timestamp: new Date() },
        { role: "user", content: text, timestamp: new Date() },
      ];
      const response = await aiProviderClient.sendMessage(config, model, messages);
      return { [key]: response.content.trim() };
    }

    const jsonInput = JSON.stringify(texts, null, 2);
    const messages: IChatMessage[] = [
      { role: "system", content: `You are a professional translator. Translate all JSON values from ${sourceLang} to ${targetLang}. Return a valid JSON object with the same keys and translated values. Return ONLY the JSON object, no markdown formatting, no explanations.`, timestamp: new Date() },
      { role: "user", content: jsonInput, timestamp: new Date() },
    ];

    const response = await aiProviderClient.sendMessage(config, model, messages);
    const content = response.content.trim();

    try {
      return JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error("Failed to parse AI translation response");
    }
  },
};
