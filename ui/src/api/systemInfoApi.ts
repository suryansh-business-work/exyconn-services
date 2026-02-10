import axios from "axios";
import {
  SystemInfoResponse,
  DockerInfoResponse,
  DockerContainer,
  DockerContainerDetail,
  DockerImage,
  DockerVolume,
  DockerNetwork,
} from "../types/systemInfo";
import { API_BASE } from "./config";

export const systemInfoApi = {
  getSystemInfo: async (): Promise<SystemInfoResponse> => {
    const response = await axios.get(`${API_BASE}/system-info`);
    return response.data;
  },

  getDockerInfo: async (): Promise<DockerInfoResponse> => {
    const response = await axios.get(`${API_BASE}/system-info/docker`);
    return response.data;
  },

  getDockerContainers: async (
    showAll = true,
  ): Promise<{ containers: DockerContainer[] }> => {
    const response = await axios.get(
      `${API_BASE}/system-info/docker/containers`,
      { params: { all: showAll } },
    );
    return response.data;
  },

  getDockerContainerDetail: async (
    containerId: string,
  ): Promise<DockerContainerDetail> => {
    const response = await axios.get(
      `${API_BASE}/system-info/docker/containers/${containerId}`,
    );
    return response.data;
  },

  getDockerImages: async (): Promise<{ images: DockerImage[] }> => {
    const response = await axios.get(
      `${API_BASE}/system-info/docker/images`,
    );
    return response.data;
  },

  getDockerVolumes: async (): Promise<{ volumes: DockerVolume[] }> => {
    const response = await axios.get(
      `${API_BASE}/system-info/docker/volumes`,
    );
    return response.data;
  },

  getDockerNetworks: async (): Promise<{ networks: DockerNetwork[] }> => {
    const response = await axios.get(
      `${API_BASE}/system-info/docker/networks`,
    );
    return response.data;
  },
};
