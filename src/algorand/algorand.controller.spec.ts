import { Test, TestingModule } from '@nestjs/testing';
import AlgorandClient from '../lib/AlgorandClient';
import AlgorandController from './algorand.controller';
import AlgorandService from './algorand.service';
import { DefaultParams } from './algosdk.types';

describe('AppController', () => {
  let app: TestingModule;
  let algorandService: AlgorandService;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AlgorandController],
      providers: [AlgorandService, AlgorandClient],
    }).compile();

    algorandService = app.get<AlgorandService>(AlgorandService);
  });

  describe('Default parameters', () => {
    it('Should return default parameters', async () => {
      const algorandController = app.get<AlgorandController>(
        AlgorandController,
      );

      const defaultParameters: DefaultParams = {
        fee: 100,
        firstRound: 123,
        flatFee: true,
        genesisHash: 'hash',
        genesisID: 'id',
        lastRound: 123,
      };

      jest
        .spyOn(algorandService, 'getTransactionDefaultParameters')
        .mockImplementation(() => new Promise((r) => r(defaultParameters)));

      expect(
        await algorandController.getTransactionDefaultParameters(),
      ).toEqual(defaultParameters);
    });
  });
});
