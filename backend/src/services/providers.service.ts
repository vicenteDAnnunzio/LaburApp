import prisma from '../lib/prisma';

interface ListProvidersQuery {
  zona?: string;
  servicio?: string;
}

interface ProviderResponse {
  id: string;
  name: string;
  zona: string;
  servicios: string[];
  experiencia: number;
  descripcion?: string;
  telefono?: string;
}

interface UpdateProfileInput {
  zona?: string;
  servicios?: string[];
  experiencia?: number;
  descripcion?: string;
  telefono?: string;
}

export class ProvidersService {
  async listProviders(query: ListProvidersQuery): Promise<ProviderResponse[]> {
    const { zona, servicio } = query;

    // Construir filtros dinámicos
    const where: any = {};

    if (zona) {
      where.zona = zona;
    }

    if (servicio) {
      where.servicios = {
        has: servicio,
      };
    }

    // Buscar ProviderProfiles con filtros
    const providerProfiles = await prisma.providerProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        experiencia: 'desc',
      },
    });

    // Mapear a formato de respuesta
    return providerProfiles.map((profile) => ({
      id: profile.userId,
      name: profile.user.name,
      zona: profile.zona,
      servicios: profile.servicios,
      experiencia: profile.experiencia,
      descripcion: profile.descripcion ?? undefined,
      telefono: profile.telefono ?? undefined,
    }));
  }

  async updateMyProfile(userId: string, input: UpdateProfileInput) {
    // Verificar que el usuario tiene ProviderProfile
    const existingProfile = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      const error = new Error('Provider profile not found');
      (error as any).statusCode = 404;
      throw error;
    }

    // Actualizar ProviderProfile
    const updatedProfile = await prisma.providerProfile.update({
      where: { userId },
      data: {
        ...(input.zona !== undefined && { zona: input.zona }),
        ...(input.servicios !== undefined && { servicios: input.servicios }),
        ...(input.experiencia !== undefined && { experiencia: input.experiencia }),
        ...(input.descripcion !== undefined && { descripcion: input.descripcion }),
        ...(input.telefono !== undefined && { telefono: input.telefono }),
      },
    });

    return updatedProfile;
  }
}

export const providersService = new ProvidersService();
