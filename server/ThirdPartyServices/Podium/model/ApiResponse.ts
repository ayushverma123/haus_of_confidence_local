import { PodiumMetadata } from "./PodiumMetadata";

export interface ApiResponse<T> {
    data: T,
    metadata: PodiumMetadata
}