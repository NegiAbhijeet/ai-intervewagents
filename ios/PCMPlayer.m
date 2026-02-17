#import <React/RCTBridgeModule.h>
#import <Foundation/Foundation.h>
@interface RCT_EXTERN_MODULE(PCMPlayer, NSObject)

RCT_EXTERN_METHOD(init:(nonnull NSNumber *)sampleRate
                  channels:(nonnull NSNumber *)channels
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(play:(NSArray *)data
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stop:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
