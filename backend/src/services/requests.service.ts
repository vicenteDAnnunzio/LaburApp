import prisma from '../lib/prisma';
import { RequestStatus, Urgency } from '@prisma/client';

interface CreateRequestInput {
  providerId: string;
  title: string;
  description: string;
  location: string;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH';
  budget?: number;
  scheduledAt?: string;
}

interface UpdateRequestAction {
  action: 'accept' | 'reject' | 'cancel';
}

export class RequestsService {
  async create(clientId: string, input: CreateRequestInput) {
    const { providerId, title, description, location, urgency, budget, scheduledAt } = input;

    // Verificar que el provider existe y tiene ProviderProfile
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: providerId },
    });

    if (!providerProfile) {
      const error = new Error('Provider not found');
      (error as any).statusCode = 404;
      throw error;
    }

    // Crear ServiceRequest
    const request = await prisma.serviceRequest.create({
      data: {
        clientId,
        providerId,
        title,
        description,
        location,
        urgency: urgency ? (urgency as Urgency) : 'MEDIUM',
        budget,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: 'PENDING',
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        provider: { select: { userId: true, zona: true, servicios: true, user: { select: { name: true } } } },
      },
    });

    return request;
  }

  async listAsClient(clientId: string) {
    const requests = await prisma.serviceRequest.findMany({
      where: {
        clientId,
      },
      include: {
        provider: { select: { userId: true, zona: true, servicios: true, user: { select: { name: true } } } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requests;
  }

  async listAsProvider(providerId: string) {
    const requests = await prisma.serviceRequest.findMany({
      where: {
        providerId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requests;
  }

  async updateAction(
    requestId: string,
    userId: string,
    userRole: string,
    input: UpdateRequestAction
  ) {
    const { action } = input;

    // Buscar la request
    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      const error = new Error('Request not found');
      (error as any).statusCode = 404;
      throw error;
    }

    // Validar permisos segÃºn la acciÃ³n
    if (action === 'accept' || action === 'reject') {
      // Solo el PROVIDER dueÃ±o puede aceptar/rechazar
      if (userRole !== 'PROVIDER' || request.providerId !== userId) {
        const error = new Error('Only the provider can accept or reject this request');
        (error as any).statusCode = 403;
        throw error;
      }
    } else if (action === 'cancel') {
      // Solo el CLIENT dueÃ±o puede cancelar
      if (userRole !== 'CLIENT' || request.clientId !== userId) {
        const error = new Error('Only the client can cancel this request');
        (error as any).statusCode = 403;
        throw error;
      }
    }

    // Mapear action a status segÃºn la acciÃ³n del usuario
    const statusMap: Record<string, RequestStatus> = {
      accept: 'ACCEPTED',
      reject: 'REJECTED',
      cancel: 'CANCELLED',
    };

    const newStatus = statusMap[action];

    // Actualizar request
    const updatedRequest = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        provider: { select: { userId: true, zona: true, servicios: true, user: { select: { name: true } } } },
      },
    });

    return updatedRequest;
  }
}

export const requestsService = new RequestsService();


